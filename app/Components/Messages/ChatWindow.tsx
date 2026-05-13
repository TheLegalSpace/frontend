"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { Message } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, disconnectSocket } from "@/services/socket.services";
import AnonymousBanner from "./AnonymousBanner";

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
}
 
export default function ChatWindow({
  conversationId,
  participantName,
  currentAccountId,
  isAnonymous,
  onAnonymousToggle,
  onClose,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
 
  const loadMessages = useCallback(async () => {
    try {
      const data = await messagesService.getMessages(conversationId);
      const items: Message[] = data?.data?.items ?? data?.data ?? [];
      setMessages(items);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);
 
  // Initial load when conversation changes
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages();
  }, [loadMessages]);
 
  // Socket setup
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);
 
    socket.emit("conversation:join", { conversationId });
 
    socket.on("message", (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });
 
    socket.on(
      "message:read",
      ({ messageId }: { conversationId: string; messageId: string; readAt: string; readByAccountId: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, readAt: new Date().toISOString() } : m
          )
        );
      }
    );
 
    socket.on("connect_error", (err: { message: string; }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        disconnectSocket();
        connectSocket(newToken);
      }
    });
 
    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message");
      socket.off("message:read");
      socket.off("connect_error");
    };
  }, [conversationId]);
 
  // Polling fallback every 10s — catches anything the socket misses
  useEffect(() => {
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [loadMessages]);
 
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
 
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);
 
    try {
      await messagesService.sendMessage(conversationId, text);
      await loadMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
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
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white">
        <span className="text-[15px] font-semibold text-gray-900">
          {participantName}
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-full bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-700 transition"
        >
          Review
        </button>
      </div>
 
      {/* Anonymous banner */}
      <AnonymousBanner isAnonymous={isAnonymous} onToggle={onAnonymousToggle} />
 
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            <Loader2 size={18} className="animate-spin mr-2" /> Loading...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No messages yet. Say hello!
          </div>
        ) : (
          grouped.map((group) => (
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
                      className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isSent
                          ? "bg-blue-700 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-sm"
                      }`}
                    >
                      <p>{msg.body}</p>
                      <p className={`text-[11px] mt-1 ${isSent ? "text-blue-200" : "text-gray-400"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
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
          className="w-9 h-9 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center transition disabled:opacity-50"
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