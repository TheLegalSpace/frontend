"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Send, Loader2, Lock, ArrowLeft } from "lucide-react";
import { Message } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, disconnectSocket } from "@/services/socket.services";
import AnonymousBanner from "./AnonymousBanner";
import ReviewModal from "./ReviewModal";
import { useAuth } from "@/app/context/AuthContext";

// ── Cache ─────────────────────────────────────────────────────────────────────
function getCachedMessages(conversationId: string): Message[] {
  try {
    const raw = localStorage.getItem(`messages:${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCachedMessages(conversationId: string, messages: Message[]) {
  try {
    localStorage.setItem(`messages:${conversationId}`, JSON.stringify(messages));
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

/**
 * Merge incoming messages with existing ones.
 * - Removes temp optimistic messages that match a real one by body
 * - Deduplicates by id
 * - Keeps chronological order
 */
function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const temps = existing.filter(
    (m) => m.id.startsWith("temp-") && !incoming.some((r) => r.body === m.body)
  );
  const merged = [...incoming, ...temps];
  merged.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return merged;
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
  conversationStatus: "open" | "closed";
  onConversationClosed: () => void;
  /**
   * For CLIENT: whether the client is chatting anonymously.
   * For LAWYER: whether the OTHER PARTY (client) is anonymous —
   *   i.e. has the client revealed their identity yet?
   */
  isAnonymous: boolean;
  onAnonymousToggle: (val: boolean) => void;
  onClose: () => void;
  showBackButton?: boolean;
}

export default function ChatWindow({
  conversationId,
  participantName,
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

  const [messages, setMessages] = useState<Message[]>(() =>
    getCachedMessages(conversationId)
  );
  const [loading, setLoading] = useState(
    () => getCachedMessages(conversationId).length === 0
  );
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState("");
  const [showReview, setShowReview] = useState(false);

  const [hasReviewed, setHasReviewedState] = useState(() =>
    getHasReviewed(conversationId)
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
    const cached = getCachedMessages(conversationId);
    setMessages(cached);
    setLoading(cached.length === 0);
    setHasReviewedState(getHasReviewed(conversationId));
  }, [conversationId]);

  const loadMessages = useCallback(async () => {
    const id = conversationIdRef.current;
    try {
      const data = await messagesService.getMessages(id);
      const fresh: Message[] = (data?.data?.items ?? data?.data ?? []).reverse();

      setMessages((prev) => {
        if (conversationIdRef.current !== id) return prev;
        const merged = mergeMessages(prev, fresh);
        setCachedMessages(id, merged);
        return merged;
      });
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [conversationId, loadMessages]);

  // Socket setup
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);
    socket.emit("conversation:join", { conversationId });

    socket.on("message", (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          const withoutTemp = prev.filter(
            (m) => !(m.id.startsWith("temp-") && m.body === msg.body)
          );
          if (withoutTemp.find((m) => m.id === msg.id)) return withoutTemp;
          const updated = [...withoutTemp, msg];
          setCachedMessages(conversationId, updated);
          return updated;
        });
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
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === messageId ? { ...m, readAt: new Date().toISOString() } : m
          );
          setCachedMessages(conversationId, updated);
          return updated;
        });
      }
    );

    socket.on("connect_error", (err: { message: string }) => {
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

  // Polling fallback every 10s
  useEffect(() => {
    if (isClosed) return;
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, [loadMessages, isClosed]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    setMessages((prev) => {
      const updated = [...prev, optimistic];
      setCachedMessages(conversationId, updated);
      return updated;
    });
    setInput("");
    setSending(true);

    try {
      const res = await messagesService.sendMessage(conversationId, text);
      const sentMessage: Message = res?.data ?? res;
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === tempId ? sentMessage : m));
        setCachedMessages(conversationId, updated);
        return updated;
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== tempId);
        setCachedMessages(conversationId, updated);
        return updated;
      });
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

  // Review button state
  const reviewDisabled = !isClosed || hasReviewed;
  const reviewLabel = hasReviewed ? "Reviewed" : "Review";
  const reviewTitle = hasReviewed
    ? "You have already reviewed this conversation"
    : !isClosed
    ? "Close the conversation first to leave a review"
    : "Leave a review";

  // ── Banner visibility logic ────────────────────────────────────────────────
  //
  // "Engage outside TLS" should appear as soon as the conversation is open
  // (not closed). On the LAWYER side it shows regardless of anonymous state —
  // the lawyer always sees the option to engage. On the CLIENT side it shows
  // once the client has revealed their identity (isAnonymous === false).
  //
  // Previously this was `!isAnonymous && !isClosed` which meant lawyers saw
  // it only after the client revealed — that was wrong.
  //
  // FIX: Lawyers see the engage banner whenever the convo is open.
  //      Clients see it only after they've revealed (isAnonymous === false).
  const showEngageBanner = isLawyer
    ? !isClosed
    : !isAnonymous && !isClosed;

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
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-medium font-['Instrument_Serif'] text-gray-900">
                {participantName}
              </span>
              {isClosed && (
                <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                  Closed
                </span>
              )}
            </div>
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

        {/* Anonymous banner — CLIENT ONLY.
            Lawyers are always identifiable; this banner is never relevant to them.
            isAnonymous here means "the client is still hidden". */}
        {!isLawyer && (
          <AnonymousBanner isAnonymous={isAnonymous} onToggle={onAnonymousToggle} />
        )}

        {/* Identity revealed notice — client side only */}
        {!isLawyer && !isAnonymous && (
          <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-blue-700 text-[12px]">
            <span>🔓</span>
            <span>
              You are no longer chatting anonymously. This lawyer can see your
              name and contact details.
            </span>
          </div>
        )}

        {/* "Engage outside TLS" banner.
            LAWYER: always shown while conversation is open (they drive this action).
            CLIENT: shown only after revealing identity.
            Previously used `!isAnonymous && !isClosed` for both roles, which
            meant lawyers had to wait for the client to reveal before seeing it. */}
        {showEngageBanner && (
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
            <p className="text-[12px] text-gray-600">
              {isLawyer ? (
                <>
                  You can now proceed with{" "}
                  <span className="font-semibold">{participantName}</span>'s
                  matter outside TLS.
                </>
              ) : (
                <>
                  <span className="font-semibold">{participantName}</span> would
                  like to proceed with your matter outside TLS.
                </>
              )}
            </p>
            {isLawyer && (
              <button
                onClick={handleCloseConversation}
                disabled={closing}
                className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-medium rounded-lg transition disabled:opacity-60"
              >
                {closing && <Loader2 size={12} className="animate-spin" />}
                Engage outside TLS
              </button>
            )}
          </div>
        )}

        {/* Closed notice */}
        {isClosed && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-center text-[12px] text-gray-500">
            This conversation has been closed. You can no longer send messages.{" "}
            {!hasReviewed && (
              <button
                onClick={() => setShowReview(true)}
                className="text-blue-600 hover:underline font-medium"
              >
                Leave a review
              </button>
            )}
            {hasReviewed && (
              <span className="text-green-600 font-medium">Review submitted ✓</span>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 font-['Geist'] justify-end">
          {loading ? (
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
    </>
  );
}