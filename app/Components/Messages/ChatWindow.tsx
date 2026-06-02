"use client"

import { useEffect, useState, useRef } from "react";
import { Send, Loader2, Lock, ArrowLeft } from "lucide-react";
import { Message } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, refreshSocketAuth } from "@/services/socket.services";
import AnonymousBanner from "./AnonymousBanner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ── Cache helpers ─────────────────────────────────────────────────────────────
const MESSAGE_CACHE_LIMIT = 100;
const MESSAGE_CACHE_TTL_MS = 1000 * 60 * 30;

function getCachedMessages(conversationId: string): Message[] {
  try {
    const raw = localStorage.getItem(`messages:${conversationId}`);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as
      | Message[]
      | { updatedAt?: number; items?: Message[] };

    if (Array.isArray(parsed)) return parsed;
    if (
      parsed.updatedAt &&
      Date.now() - parsed.updatedAt > MESSAGE_CACHE_TTL_MS
    ) {
      localStorage.removeItem(`messages:${conversationId}`);
      return [];
    }

    return parsed.items ?? [];
  } catch {
    return [];
  }
}

function setCachedMessages(conversationId: string, messages: Message[]) {
  try {
    localStorage.setItem(
      `messages:${conversationId}`,
      JSON.stringify({
        updatedAt: Date.now(),
        items: messages.slice(-MESSAGE_CACHE_LIMIT),
      })
    );
  } catch {}
}

function mergeMessages(current: Message[], incoming: Message[]) {
  const byId = new Map<string, Message>();

  [...current, ...incoming].forEach((message) => {
    byId.set(message.id, message);
  });

  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  return isToday
    ? "Today"
    : d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
}

interface Props {
  conversationId: string;
  participantName: string;
  currentAccountId: string;
  isAnonymous: boolean;
  onAnonymousToggle: (val: boolean) => void;
  onClose: () => void;
  showBackButton?: boolean; // ← shown on mobile to go back to list
}

export default function ChatWindow({
  conversationId,
  participantName,
  currentAccountId,
  isAnonymous,
  onAnonymousToggle,
  onClose,
  showBackButton = false,
}: Props) {
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const cachedMessages = getCachedMessages(conversationId);
  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const data = await messagesService.getMessages(conversationId);
      const items = (data?.data?.items ?? data?.data ?? []) as Message[];
      return mergeMessages([], [...items].reverse());
    },
    initialData: cachedMessages.length > 0 ? cachedMessages : undefined,
    staleTime: 1000 * 20,
  });
  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    if (messages.length > 0) {
      setCachedMessages(conversationId, messages);
    }
  }, [conversationId, messages]);

  // Socket setup
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    socket.emit("conversation:join", { conversationId });

    const handleMessage = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        queryClient.setQueryData<Message[]>(
          ["messages", conversationId],
          (prev = []) => mergeMessages(prev, [msg])
        );
        queryClient.setQueryData(["conversations"], (prev: any) =>
          Array.isArray(prev)
            ? prev.map((conversation) =>
                conversation.id === conversationId
                  ? {
                      ...conversation,
                      lastMessage: msg.body,
                      lastMessageAt: msg.createdAt,
                    }
                  : conversation
              )
            : prev
        );
      }
    };

    const handleMessageRead = ({
      messageId,
      readAt,
    }: {
      conversationId: string;
      messageId: string;
      readAt: string;
      readByAccountId: string;
    }) => {
      queryClient.setQueryData<Message[]>(["messages", conversationId], (prev = []) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, readAt } : message
        )
      );
    };

    const handleConnectError = (err: { message: string }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        refreshSocketAuth(newToken);
      }
    };

    const handleConnect = () => {
      socket.emit("conversation:join", { conversationId });
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    };

    socket.on("message", handleMessage);
    socket.on("message:read", handleMessageRead);
    socket.on("connect_error", handleConnectError);
    socket.on("connect", handleConnect);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message", handleMessage);
      socket.off("message:read", handleMessageRead);
      socket.off("connect_error", handleConnectError);
      socket.off("connect", handleConnect);
    };
  }, [conversationId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderAccountId: currentAccountId,
      body: text,
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData<Message[]>(["messages", conversationId], (prev = []) =>
      mergeMessages(prev, [optimistic])
    );
    setInput("");
    setSending(true);

    try {
      await messagesService.sendMessage(conversationId, text);
      await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (err) {
      console.error("Failed to send message:", err);
      queryClient.setQueryData<Message[]>(["messages", conversationId], (prev = []) =>
        prev.filter((message) => message.id !== optimistic.id)
      );
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Group messages by date label
  const grouped: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const label = formatDateLabel(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === label) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: label, messages: [msg] });
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          {/* Back button — mobile only */}
          {showBackButton && (
            <button
              onClick={onClose}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
          )}
          <span className="text-[20px] font-medium font-['Instrument_Serif'] text-gray-900">
            {participantName}
          </span>
        </div>

        {/* Review button — hidden on mobile to save space */}
        <button
          onClick={onClose}
          className="hidden md:block px-4 py-1.5 rounded-full bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition"
        >
          Review
        </button>
      </div>

      {/* Anonymous banner */}
      <AnonymousBanner isAnonymous={isAnonymous} onToggle={onAnonymousToggle} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 font-['Geist'] justify-end">
        {messagesQuery.isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No messages yet. Say hello!
          </div>
        ) : (
          <>
            {/* Encryption notice */}
            <div className="flex justify-center my-3">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 max-w-sm text-center">
                <Lock size={13} className="text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Messages use end-to-end encryption, allowing only chat
                  participants to read them. Messages will be deleted after 14
                  days.
                </p>
              </div>
            </div>

            {/* Message groups */}
            {grouped.map((group) => (
              <div key={group.date}>
                <div className="text-center text-[11px] text-gray-400 my-2">
                  {group.date} · Conversation started
                </div>
                {group.messages.map((msg) => {
                  const isSent = msg.senderAccountId === currentAccountId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex mb-2 ${isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isSent
                            ? "bg-blue-700 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-sm"
                        }`}
                      >
                        <p>{msg.body}</p>
                        <p
                          className={`text-[11px] mt-1 ${
                            isSent ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-full outline-none focus:border-gray-300 placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center transition disabled:opacity-50 shrink-0"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 size={15} className="text-white animate-spin" />
          ) : (
            <Send size={15} className="text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
