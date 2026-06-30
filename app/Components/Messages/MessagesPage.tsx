// app/Components/Messages/MessagesPage.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/app/types/message";
import { connectSocket } from "@/services/socket.services";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useAuth } from "@/app/context/AuthContext";
import { useConversationCache, useConversations } from "@/hooks/useMessages";
import ReviewButton from "./ReviewButton";
import ReviewModal from "./ReviewModal";

// ── Persist anonymous state per conversation in localStorage ─────────────────
function getStoredAnonymous(
  conversationId: string,
  role: string,
): boolean | null {
  try {
    const raw = localStorage.getItem(`anon:${role}:${conversationId}`);
    if (raw === null) return null;
    return raw === "true";
  } catch {
    return null;
  }
}

function storeAnonymous(conversationId: string, role: string, value: boolean) {
  try {
    localStorage.setItem(`anon:${role}:${conversationId}`, String(value));
  } catch {}
}

export default function MessagesPage() {
  const { user } = useAuth();
  const isLawyer = user?.role === "LAWYER";
  const searchParams = useSearchParams();

  const { data: conversations = [], isLoading } = useConversations();
  const {
    fetchAndUpsertConversation,
    refreshConversation,
    upsertConversation,
    patchConversation,
    invalidateConversations,
  } = useConversationCache();

  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Anonymous state initialisation ────────────────────────────────────────
  // Use an explicit === true check so that users whose profile doesn't include
  // isAnonymous (undefined / null) are treated as NOT anonymous by default.
  // This prevents non-anonymous users from ever seeing the anonymous banner.
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    () => user?.isAnonymous === true,
  );

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const conversationsRef = useRef<Conversation[]>([]);
  conversationsRef.current = conversations;

  // ── Auto-select first conversation ────────────────────────────────────────
  useEffect(() => {
    setActiveId((prev) => {
      if (prev) return prev;
      return conversations.length > 0 ? conversations[0].id : null;
    });
  }, [conversations]);

  // ── Handle ?conversation= query param ────────────────────────────────────
  useEffect(() => {
    const id = searchParams.get("conversation");
    if (!id) return;

    setActiveId(id);
    setMobileView("chat");

    const alreadyLoaded = conversationsRef.current.find((c) => c.id === id);
    if (alreadyLoaded) return;

    fetchAndUpsertConversation(id).catch(console.error);
  }, [searchParams, fetchAndUpsertConversation]);

  // ── Page-level socket events ──────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    const handleStatusChanged = ({
      status,
      conversationId,
    }: {
      requestId: string;
      status: string;
      conversationId?: string;
    }) => {
      if (status === "accepted" && conversationId) {
        socket.emit("conversation:join", { conversationId });

        fetchAndUpsertConversation(conversationId).catch(() => {
          invalidateConversations();
        });

        if (isMounted) {
          setActiveId(conversationId);
          setMobileView("chat");
        }
      }
    };

    const handleConversationUpdated = (conv: {
      id: string;
      status?: string;
      isAnonymous?: boolean;
    }) => {
      if (conv.status === "closed") {
        patchConversation(conv.id, { status: "closed" });
      }
      if (conv.isAnonymous === false) {
        refreshConversation(conv.id);
      }
    };

    const handleParticipantUpdated = (payload: {
      conversationId: string;
      isAnonymous: boolean;
    }) => {
      refreshConversation(payload.conversationId);
    };

    const handleConnectError = (err: { message: string }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        socket.auth = { token: newToken };
        socket.connect();
      }
    };

    const handleConnect = () => {
      invalidateConversations();
    };

    socket.on("request:status_changed", handleStatusChanged);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("participant:updated", handleParticipantUpdated);
    socket.on("connect_error", handleConnectError);
    socket.on("connect", handleConnect);

    return () => {
      isMounted = false;
      socket.off("request:status_changed", handleStatusChanged);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("participant:updated", handleParticipantUpdated);
      socket.off("connect_error", handleConnectError);
      socket.off("connect", handleConnect);
    };
  }, [
    fetchAndUpsertConversation,
    invalidateConversations,
    patchConversation,
    refreshConversation,
  ]);

  // ── Re-fetch if otherParty missing ────────────────────────────────────────
  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (activeId && activeConvo && !activeConvo.otherParty) {
      refreshConversation(activeId);
    }
  }, [activeId, activeConvo, refreshConversation]);

  // ── Sync isAnonymous when conversation changes ────────────────────────────
  // Priority order:
  //   1. Per-conversation localStorage override (set after a "reveal" action)
  //   2. User profile value — only true if explicitly === true
  //   3. Fallback: false (not anonymous)
  useEffect(() => {
    if (isLawyer) return;

    // Explicit check — undefined/null/false all resolve to false (not anonymous)
    const profileValue = user?.isAnonymous === true;

    if (!activeId) {
      setIsAnonymous(profileValue);
      return;
    }

    const role = user?.role ?? "client";
    const stored = getStoredAnonymous(activeId, role);

    if (stored !== null) {
      setIsAnonymous(stored);
    } else {
      setIsAnonymous(profileValue);
    }
  }, [activeId, isLawyer, user?.isAnonymous, user?.role]);

  // ── Conversation selection ────────────────────────────────────────────────
  const handleSelectConvo = useCallback(
    (id: string) => {
      setActiveId(id);
      setMobileView("chat");

      if (!isLawyer) {
        const stored = getStoredAnonymous(id, user?.role ?? "client");
        const profileValue = user?.isAnonymous === true;
        setIsAnonymous(stored !== null ? stored : profileValue);
      }
    },
    [isLawyer, user?.role, user?.isAnonymous],
  );

  const handleBackToList = useCallback(() => {
    setMobileView("list");
  }, []);

  const handleConversationClosed = useCallback(() => {
    if (!activeId) return;
    patchConversation(activeId, { status: "closed" });
  }, [activeId, patchConversation]);

  const handleAnonymousToggle = useCallback(
    (val: boolean) => {
      setIsAnonymous(val);

      if (activeId) {
        storeAnonymous(activeId, user?.role ?? "client", val);

        if (activeConvo) {
          upsertConversation({
            ...activeConvo,
            otherParty: activeConvo.otherParty
              ? { ...activeConvo.otherParty, isAnonymous: val }
              : activeConvo.otherParty,
          });
        }

        refreshConversation(activeId);
      }
    },
    [
      activeConvo,
      activeId,
      refreshConversation,
      upsertConversation,
      user?.role,
    ],
  );

  // ── Resolve isAnonymous for active chat ───────────────────────────────────
  // For lawyers: read from the conversation's otherParty (the client's status)
  // For clients: use the local isAnonymous state (profile + per-convo override)
  const activeIsAnonymous: boolean | null = isLawyer
    ? (activeConvo?.otherParty?.isAnonymous ?? null)
    : isAnonymous;

  function getParticipantName(convo: Conversation): string {
    if (!convo.otherParty) return "Anonymous User";
    if (convo.otherParty.isAnonymous !== false) return "Anonymous User";
    return convo.otherParty.fullName || "Anonymous User";
  }

  const [hasReviewed, setHasReviewed] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!activeId) return;
    try {
      setHasReviewed(localStorage.getItem(`reviewed:${activeId}`) === "true");
    } catch {
      setHasReviewed(false);
    }
  }, [activeId]);

  return (
    <div className="flex-1 h-screen overflow-hidden">
      <div className="w-full bg-white md:border md:border-l-0 md:border-b-0 md:border-gray-200 overflow-hidden md:flex md:shadow-sm h-screen flex flex-col">
        <div className="flex">
          <div className="w-full flex items-center md:w-64 md:min-w-64 md:border-r border-b border-gray-200 font-['Instrument_Serif'] text-gray-900">
            <span className="pl-[3%] font-[Instrument_Serif] text-[20px] leading-none font-light text-[#1F2937]">
              Messages
            </span>
          </div>

          <div className="hidden md:flex md:gap-2 pe-4 h-[74px] w-full md:items-center justify-between border-l-0 border-b border-[#E6EAED]">
            <div className="flex items-center mx-[15px] gap-2 h-full">
              {activeConvo && (
                <span className="text-[20px] font-medium font-['Instrument_Serif'] text-gray-900">
                  {getParticipantName(activeConvo)}
                </span>
              )}
              {activeConvo?.status === "closed" && (
                <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                  Closed
                </span>
              )}
            </div>
            {activeConvo && (
              <ReviewButton
                isClosed={activeConvo.status === "closed"}
                hasReviewed={hasReviewed}
                onClick={() => setShowReview(true)}
              />
            )}
          </div>
        </div>

        {showReview && activeId && activeConvo && (
          <ReviewModal
            conversationId={activeId}
            participantName={getParticipantName(activeConvo)}
            reviewerRole={isLawyer ? "lawyer" : "client"}
            onClose={() => setShowReview(false)}
            onSubmitted={() => {
              setHasReviewed(true);
              setShowReview(false);
            }}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Conversation list */}
          <div
            className={`${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col w-full md:w-auto`}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConvo}
              loading={isLoading}
            />
          </div>

          {/* Chat window */}
          <div
            className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}
          >
            {activeId && activeConvo ? (
              <ChatWindow
                onReviewClick={() => setShowReview(true)}
                onHasReviewedChange={setHasReviewed}
                conversationId={activeId}
                participantName={getParticipantName(activeConvo)}
                participantPhone={activeConvo.otherParty?.phone ?? null}
                participantEmail={activeConvo.otherParty?.email ?? null}
                currentAccountId={user?.id ?? ""}
                conversationStatus={activeConvo.status}
                onConversationClosed={handleConversationClosed}
                isAnonymous={activeIsAnonymous}
                onAnonymousToggle={handleAnonymousToggle}
                onClose={handleBackToList}
                showBackButton={true}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <MessageSquare size={32} strokeWidth={1.5} />
                <p className="text-sm">
                  Select a conversation to start chatting
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
