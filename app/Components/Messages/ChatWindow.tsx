// app/Components/Messages/ChatWindow.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Loader2, Lock, ArrowLeft } from "lucide-react";
import { Message } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, refreshSocketAuth } from "@/services/socket.services";
import AnonymousBanner from "./AnonymousBanner";
import ReviewModal from "./ReviewModal";
import EngagementModal from "./EngagementModal";
import { useAuth } from "@/app/context/AuthContext";
import { messageKeys, useMessageCache, useMessages } from "@/hooks/useMessages";
import { useQueryClient } from "@tanstack/react-query";

// ── localStorage cache helpers ────────────────────────────────────────────────
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
      }),
    );
  } catch {}
}

function getHasReviewed(conversationId: string): boolean {
  try {
    return localStorage.getItem(`reviewed:${conversationId}`) === "true";
  } catch {
    return false;
  }
}

function setHasReviewed(conversationId: string) {
  try {
    localStorage.setItem(`reviewed:${conversationId}`, "true");
  } catch {}
}

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

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  conversationId: string;
  participantName: string;
  participantPhone?: string | null;
  participantEmail?: string | null;
  currentAccountId: string;
  conversationStatus: "open" | "closed";
  onConversationClosed: () => void;
  /** null = not yet known; true = anonymous; false = revealed */
  isAnonymous: boolean | null;
  onAnonymousToggle: (val: boolean) => void;
  onClose: () => void;
  showBackButton?: boolean;
}

export default function ChatWindow({
  conversationId,
  participantName,
  participantPhone,
  participantEmail,
  currentAccountId,
  conversationStatus,
  onConversationClosed,
  isAnonymous,
  onAnonymousToggle,
  onClose,
  showBackButton = false,
}: Props) {
  const { user } = useAuth();
  const isLawyer = user?.role === "LAWYER";
  const reviewerRole: "client" | "lawyer" = isLawyer ? "lawyer" : "client";
  const isClosed = conversationStatus === "closed";

  const queryClient = useQueryClient();
  const { appendMessage, markMessageRead, setMessages } =
    useMessageCache(conversationId);

  // ── Seed TanStack cache from localStorage on first load ───────────────────
  useEffect(() => {
    const key = messageKeys.list(conversationId);
    const existing = queryClient.getQueryData<Message[]>(key);
    if (existing && existing.length > 0) return;

    const cached = getCachedMessages(conversationId);
    if (cached.length > 0) {
      queryClient.setQueryData(key, cached);
    }
  }, [conversationId, queryClient]);

  const { data: messages = [], isLoading } = useMessages(conversationId, {
    refetchInterval: isClosed ? false : 10000,
  });

  // ── Persist to localStorage whenever messages update ─────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setCachedMessages(conversationId, messages);
    }
  }, [conversationId, messages]);

  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [hasReviewed, setHasReviewedState] = useState(() =>
    getHasReviewed(conversationId),
  );

  const engageBannerKey = `engage-banner:${conversationId}`;
  const [showEngageBanner, setShowEngageBanner] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(engageBannerKey) === "true";
    } catch {
      return false;
    }
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Show engage banner when conversation is closed (client only) ──────────
  useEffect(() => {
    if (!isLawyer && isClosed) {
      const alreadyDismissed =
        localStorage.getItem(`engage-dismissed:${conversationId}`) === "true";
      if (!alreadyDismissed) {
        setShowEngageBanner(true);
        try {
          localStorage.setItem(engageBannerKey, "true");
        } catch {}
      }
    }
  }, [isClosed, isLawyer, conversationId, engageBannerKey]);

  // ── Sync per-conversation state when conversationId changes ──────────────
  useEffect(() => {
    setHasReviewedState(getHasReviewed(conversationId));

    if (!isLawyer) {
      const alreadyDismissed =
        localStorage.getItem(`engage-dismissed:${conversationId}`) === "true";
      const stored = localStorage.getItem(engageBannerKey) === "true";
      setShowEngageBanner(!alreadyDismissed && stored);
    }
  }, [conversationId, isLawyer, engageBannerKey]);

  function dismissEngageBanner() {
    setShowEngageBanner(false);
    try {
      localStorage.removeItem(engageBannerKey);
      localStorage.setItem(`engage-dismissed:${conversationId}`, "true");
    } catch {}
  }

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);
    socket.emit("conversation:join", { conversationId });

    socket.on("message", (msg: Message) => {
      if (msg.conversationId === conversationId) {
        appendMessage(msg);
      }
    });

    socket.on(
      "message:read",
      ({
        messageId,
      }: {
        conversationId: string;
        messageId: string;
        readAt: string;
        readByAccountId: string;
      }) => {
        markMessageRead(messageId);
      },
    );

    socket.on("connect_error", (err: { message: string }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        refreshSocketAuth(newToken);
      }
    });

    socket.on("connect", () => {
      socket.emit("conversation:join", { conversationId });
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(conversationId),
      });
    });

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message");
      socket.off("message:read");
      socket.off("connect_error");
      socket.off("connect");
    };
  }, [appendMessage, conversationId, markMessageRead, queryClient]);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Actions ───────────────────────────────────────────────────────────────
  async function handleCloseConversation() {
    if (closing || isClosed) return;
    setClosing(true);
    try {
      await messagesService.closeConversation(conversationId);
      onConversationClosed();
    } catch (err) {
      console.error("[ChatWindow] Failed to close conversation:", err);
    } finally {
      setClosing(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || isClosed) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      conversationId,
      senderAccountId: currentAccountId,
      body: text,
      createdAt: new Date().toISOString(),
    };

    // ✅ Optimistic — add to cache immediately
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);

    try {
      const res = await messagesService.sendMessage(conversationId, text);
      const sentMessage: Message = res?.data ?? res;

      // ✅ Replace temp with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? sentMessage : m)),
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      // ✅ Revert on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
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

  function handleReviewSubmitted() {
    setHasReviewed(conversationId);
    setHasReviewedState(true);
  }

  // ── Group messages by date ────────────────────────────────────────────────
  const grouped = useMemo(() => {
    const out: { date: string; messages: Message[] }[] = [];
    for (const msg of messages) {
      const label = formatDateLabel(msg.createdAt);
      const last = out[out.length - 1];
      if (last && last.date === label) {
        last.messages.push(msg);
      } else {
        out.push({ date: label, messages: [msg] });
      }
    }
    return out;
  }, [messages]);

  const reviewDisabled = !isClosed || hasReviewed;
  const reviewLabel = hasReviewed ? "Reviewed" : "Review";
  const reviewTitle = hasReviewed
    ? "You have already reviewed this conversation"
    : !isClosed
      ? "Close the conversation first to leave a review"
      : "Leave a review";

  const showLoading = isLoading && messages.length === 0;

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2">
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
            {isClosed && (
              <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                Closed
              </span>
            )}
          </div>

          {/* Review button — desktop */}
          <button
            onClick={() => !reviewDisabled && setShowReview(true)}
            disabled={reviewDisabled}
            title={reviewTitle}
            className={`hidden md:block px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
              hasReviewed
                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                : isClosed
                  ? "bg-gray-900 text-white hover:bg-gray-700 cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {reviewLabel}
          </button>
        </div>

        {/* Anonymous banner — client only */}
        {!isLawyer && (
          <AnonymousBanner
            isAnonymous={isAnonymous}
            onToggle={onAnonymousToggle}
          />
        )}

        {/* Identity revealed notice */}
        {!isLawyer && isAnonymous === false && (
          <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-blue-700 text-[12px]">
            <span>🔓</span>
            <span>
              You are no longer chatting anonymously. This lawyer can see your
              name and contact details.
            </span>
          </div>
        )}

        {/* Lawyer: engage outside TLS banner */}
        {isLawyer && !isClosed && (
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
            <p className="text-[12px] text-gray-600">
              You can now proceed with{" "}
              <span className="font-semibold">{participantName}</span>'s matter
              outside TLS.
            </p>
            <button
              onClick={handleCloseConversation}
              disabled={closing}
              className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-medium rounded-lg transition disabled:opacity-60"
            >
              {closing && <Loader2 size={12} className="animate-spin" />}
              Engage outside TLS
            </button>
          </div>
        )}

        {/* Closed notice */}
        {isClosed && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-center text-[12px] text-gray-500">
            This conversation has been closed.{" "}
            {!hasReviewed ? (
              <button
                onClick={() => setShowReview(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Leave a review
              </button>
            ) : (
              <span className="text-green-600 font-medium">
                Review submitted ✓
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 font-['Geist'] justify-end">
          {showLoading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              <Loader2 size={18} className="animate-spin mr-2" />
              Loading...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              No messages yet. Say hello!
            </div>
          ) : (
            <>
              {/* E2E encryption notice */}
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

              {grouped.map((group) => (
                <div key={group.date}>
                  <div className="text-center text-[11px] text-gray-400 my-2">
                    {group.date} · Conversation started
                  </div>
                  {group.messages.map((msg) => {
                    const isSent = msg.senderAccountId === currentAccountId;
                    const isTemp = msg.id.startsWith("temp-");
                    return (
                      <div
                        key={msg.id}
                        className={`flex mb-2 ${isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-opacity ${
                            isTemp ? "opacity-60" : "opacity-100"
                          } ${
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
                            {isTemp ? "Sending..." : formatTime(msg.createdAt)}
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

        {/* Client: lawyer wants to engage banner */}
        {!isLawyer && showEngageBanner && (
          <div className="border-t border-amber-100 bg-amber-50 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-[13px] text-gray-800 leading-snug">
              <span className="font-semibold">{participantName}</span> wants to
              connect with you outside TLS.
            </p>
            <button
              onClick={() => {
                dismissEngageBanner();
                setShowEngagementModal(true);
              }}
              className="shrink-0 px-5 py-2 bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-medium rounded-lg transition"
            >
              Yes
            </button>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center gap-3">
          {/* Mobile review trigger */}
          <button
            onClick={() => !reviewDisabled && setShowReview(true)}
            disabled={reviewDisabled}
            title={reviewTitle}
            className={`md:hidden w-8 h-8 flex items-center justify-center rounded-full border transition text-lg leading-none ${
              hasReviewed
                ? "border-green-200 text-green-600 cursor-default"
                : isClosed
                  ? "border-gray-300 text-amber-500 hover:bg-gray-50 cursor-pointer"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            aria-label={reviewLabel}
          >
            ★
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isClosed}
            placeholder={isClosed ? "Conversation closed" : "Type a message..."}
            className="flex-1 px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-full outline-none focus:border-gray-300 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || isClosed}
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

      {/* Review modal */}
      {showReview && (
        <ReviewModal
          conversationId={conversationId}
          participantName={participantName}
          reviewerRole={reviewerRole}
          onClose={() => setShowReview(false)}
          onSubmitted={handleReviewSubmitted}
        />
      )}

      {/* Engagement modal — client only */}
      {!isLawyer && showEngagementModal && (
        <EngagementModal
          lawyerName={participantName}
          lawyerPhone={participantPhone}
          lawyerEmail={participantEmail}
          onClose={() => setShowEngagementModal(false)}
          onContinueOnTLS={() => setShowEngagementModal(false)}
        />
      )}
    </>
  );
}