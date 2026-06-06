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

// ── Persist anonymous state per conversation in localStorage ─────────────────
function getStoredAnonymous(conversationId: string, role: string): boolean | null {
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
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(() =>
    user?.isAnonymous != null ? Boolean(user.isAnonymous) : null,
  );
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Ref so socket/effect closures always see the latest list
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
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    socket.on(
      "request:status_changed",
      ({
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

          setActiveId(conversationId);
          setMobileView("chat");
        }
      },
    );

    socket.on(
      "conversation:updated",
      (conv: { id: string; status?: string; isAnonymous?: boolean }) => {
        if (conv.status === "closed") {
          patchConversation(conv.id, { status: "closed" });
        }
        if (conv.isAnonymous === false) {
          refreshConversation(conv.id);
        }
      },
    );

    socket.on(
      "participant:updated",
      (payload: { conversationId: string; isAnonymous: boolean }) => {
        refreshConversation(payload.conversationId);
      },
    );

    socket.on("connect_error", (err: { message: string }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        // refreshSocketAuth if available
        socket.auth = { token: newToken };
        socket.connect();
      }
    });

    socket.on("connect", () => {
      invalidateConversations();
    });

    return () => {
      socket.off("request:status_changed");
      socket.off("conversation:updated");
      socket.off("participant:updated");
      socket.off("connect_error");
      socket.off("connect");
    };
  }, [fetchAndUpsertConversation, invalidateConversations, patchConversation, refreshConversation]);

  // ── Re-fetch if otherParty missing ────────────────────────────────────────
  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    if (activeId && activeConvo && !activeConvo.otherParty) {
      refreshConversation(activeId);
    }
  }, [activeId, activeConvo, refreshConversation]);

  // ── Sync isAnonymous ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isLawyer) return;

    const profileValue =
      user?.isAnonymous != null ? Boolean(user.isAnonymous) : null;

    if (!activeId) {
      setIsAnonymous(profileValue);
      return;
    }

    const role = user?.role ?? "client";
    const stored = getStoredAnonymous(activeId, role);
    if (stored !== null) {
      setIsAnonymous(stored);
      return;
    }

    setIsAnonymous(profileValue);
  }, [activeId, isLawyer, user?.isAnonymous, user?.role]);

  // ── Conversation selection ─────────────────────────────────────────────────
  function handleSelectConvo(id: string) {
    setActiveId(id);
    setMobileView("chat");

    if (!isLawyer) {
      const stored = getStoredAnonymous(id, user?.role ?? "client");
      const profileValue =
        user?.isAnonymous != null ? Boolean(user.isAnonymous) : null;
      setIsAnonymous(stored ?? profileValue);
    }
  }

  function handleBackToList() {
    setMobileView("list");
  }

  function handleConversationClosed() {
    if (!activeId) return;
    patchConversation(activeId, { status: "closed" });
  }

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
    [activeConvo, activeId, refreshConversation, upsertConversation, user?.role],
  );

  // ── Resolve isAnonymous for active chat ───────────────────────────────────
  const activeIsAnonymous: boolean | null = isLawyer
    ? (activeConvo?.otherParty?.isAnonymous ?? null)
    : isAnonymous;

  function getParticipantName(convo: Conversation): string {
    if (!convo.otherParty) return "Anonymous User";
    if (convo.otherParty.isAnonymous !== false) return "Anonymous User";
    return convo.otherParty.fullName || "Anonymous User";
  }

  return (
    <div className="min-h-70 bg-gray-50 md:flex md:items-start md:justify-center md:py-8 md:px-4">
      <div className="w-full md:max-w-4xl bg-white md:border md:border-gray-200 md:rounded-2xl overflow-hidden md:flex md:h-150 md:shadow-sm h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Conversation list */}
          <div className={`${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col w-full md:w-auto`}>
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConvo}
              loading={isLoading}
            />
          </div>

          {/* Chat window */}
          <div className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}>
            {activeId && activeConvo ? (
              <ChatWindow
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
                <p className="text-sm">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}