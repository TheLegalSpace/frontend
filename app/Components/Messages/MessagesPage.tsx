"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, disconnectSocket } from "@/services/socket.services";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useAuth } from "@/app/context/AuthContext";

// ── Persist anonymous state per conversation in localStorage ─────────────────
// Key is namespaced by role so a lawyer tab and client tab open in the same
// browser don't share the same key and corrupt each other's state.
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
// ─────────────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { user } = useAuth();
  const isLawyer = user?.role === "LAWYER";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // isAnonymous for the CLIENT.
  // null = not yet loaded (so we don't flash the wrong banner).
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  const searchParams = useSearchParams();

  // Keep a ref so effects that close over it always see the latest list
  // without needing to add `conversations` to their dependency arrays
  // (which caused the duplicate-entry bug).
  const conversationsRef = useRef<Conversation[]>([]);
  conversationsRef.current = conversations;

  const loadConversations = useCallback(async () => {
    try {
      const data = await messagesService.getConversations();
      const items: Conversation[] = data?.data?.items ?? data?.data ?? [];

      setConversations(items);

      // Only auto-select the first conversation if nothing is active yet
      setActiveId((prev) => {
        if (prev) return prev;
        return items.length > 0 ? items[0].id : null;
      });
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []); // no deps — stable reference

  /** Re-fetch a single conversation and update it in the list */
  const refreshConversation = useCallback(async (id: string) => {
    try {
      const data = await messagesService.getConversation(id);
      const convo: Conversation = data?.data ?? data;
      console.log("[refreshConversation] fetched:", convo);
      if (convo?.id) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convo.id ? convo : c))
        );
      }
    } catch (err) {
      console.error("Failed to refresh conversation:", err);
    }
  }, []);

  // ── Handle ?conversation= query param ──────────────────────────────────────
  // FIX: `conversations` removed from dep array entirely.
  // We use `conversationsRef` (a ref) to check for existing entries so the
  // effect only re-runs when `searchParams` changes — not on every list update.
  useEffect(() => {
    const id = searchParams.get("conversation");
    if (!id) return;

    setActiveId(id);
    setMobileView("chat");

    const alreadyLoaded = conversationsRef.current.find((c) => c.id === id);
    if (alreadyLoaded) return; // already in the list — nothing to do

    messagesService
      .getConversation(id)
      .then((data) => {
        const convo: Conversation = data?.data ?? data;
        if (!convo?.id) return;
        setConversations((prev) => {
          // Double-check inside the setter in case it arrived in the meantime
          if (prev.find((c) => c.id === convo.id)) return prev;
          return [convo, ...prev];
        });
      })
      .catch(console.error);
  }, [searchParams]); // ← ONLY searchParams, not conversations

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Page-level socket events ───────────────────────────────────────────────
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
          loadConversations();
          setActiveId(conversationId);
          setMobileView("chat");
        }
      }
    );

    socket.on(
      "conversation:updated",
      (conv: { id: string; status?: string; isAnonymous?: boolean }) => {
        console.log("[MessagesPage] conversation:updated", conv);

        if (conv.status === "closed") {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conv.id ? { ...c, status: "closed" } : c
            )
          );
        }

        if (conv.isAnonymous === false) {
          refreshConversation(conv.id);
        }
      }
    );

    socket.on(
      "participant:updated",
      (payload: { conversationId: string; isAnonymous: boolean }) => {
        console.log("[MessagesPage] participant:updated", payload);
        refreshConversation(payload.conversationId);
      }
    );

    socket.on("connect_error", (err: { message: string }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        disconnectSocket();
        connectSocket(newToken);
      }
    });

    socket.on("connect", () => {
      loadConversations();
    });

    return () => {
      socket.off("request:status_changed");
      socket.off("conversation:updated");
      socket.off("participant:updated");
      socket.off("connect_error");
      socket.off("connect");
    };
  }, [loadConversations, refreshConversation]);

  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  // If the active conversation loaded without otherParty data, re-fetch once
  useEffect(() => {
    if (activeId && activeConvo && !activeConvo.otherParty?.fullName) {
      console.log(
        "[MessagesPage] otherParty missing, re-fetching conversation:",
        activeId
      );
      refreshConversation(activeId);
    }
  }, [activeId, activeConvo, refreshConversation]);

  // ── Sync isAnonymous from the active conversation (client only) ────────────
  // Priority order:
  //   1. Locally stored value (survives refresh, set on every toggle)
  //   2. myParticipant.isAnonymous from the API
  //   3. Root-level isAnonymous on the conversation object
  //   4. null (still loading — fallback to true in the render)
  useEffect(() => {
    if (isLawyer) return;
    if (!activeId) return;

    // Always try localStorage first so the value survives a page refresh.
    // Role is included in the key so lawyer and client tabs in the same
    // browser never read each other's stored value.
    const role = user?.role ?? "client";
    const stored = getStoredAnonymous(activeId, role);
    if (stored !== null) {
      setIsAnonymous(stored);
      return;
    }

    if (!activeConvo) return;

    const serverValue =
      (activeConvo as unknown as { myParticipant?: { isAnonymous: boolean } })
        .myParticipant?.isAnonymous ??
      (activeConvo as unknown as { isAnonymous?: boolean }).isAnonymous;

    if (typeof serverValue === "boolean") {
      console.log(
        "[MessagesPage] syncing isAnonymous from conversation:",
        serverValue
      );
      setIsAnonymous(serverValue);
      storeAnonymous(activeId, role, serverValue); // persist for next refresh
    }
  }, [activeConvo, activeId, isLawyer, user?.role]);

  // ── Conversation selection ─────────────────────────────────────────────────
  function handleSelectConvo(id: string) {
    setActiveId(id);
    setMobileView("chat");

    if (!isLawyer) {
      // Restore from localStorage immediately — no flicker
      const stored = getStoredAnonymous(id, user?.role ?? "client");
      setIsAnonymous(stored); // null if never stored; will sync from convo data
    }
  }

  function handleBackToList() {
    setMobileView("list");
  }

  function handleConversationClosed() {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, status: "closed" } : c))
    );
  }

  /** Called by client's AnonymousBanner after a successful API call */
  function handleAnonymousToggle(val: boolean) {
    setIsAnonymous(val);

    // Persist so the value survives a page refresh
    if (activeId) {
      storeAnonymous(activeId, user?.role ?? "client", val);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                otherParty: c.otherParty
                  ? { ...c.otherParty, isAnonymous: val }
                  : c.otherParty,
              }
            : c
        )
      );
      refreshConversation(activeId);
    }
  }

  // For the client: if isAnonymous is still null (loading), default to true
  // so we don't accidentally flash the revealed state before data arrives.
  const activeIsAnonymous = isLawyer
    ? (activeConvo?.otherParty?.isAnonymous ?? true)
    : (isAnonymous ?? true);

  // ── Derive participant name safely ─────────────────────────────────────────
  // FIX: previously `!isAnonymous` (falsy) would show "Loading..." when
  // isAnonymous was undefined/null. Now we check explicitly for `=== false`.
  function getParticipantName(convo: Conversation): string {
    if (!convo.otherParty) return "Loading...";
    if (convo.otherParty.isAnonymous !== false) return "Anonymous User";
    return convo.otherParty.fullName || "Loading...";
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex md:items-start md:justify-center md:py-8 md:px-4">
      <div className="w-full md:max-w-4xl bg-white md:border md:border-gray-200 md:rounded-2xl overflow-hidden md:flex md:h-150 md:shadow-sm h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className={`${
              mobileView === "list" ? "flex" : "hidden"
            } md:flex flex-col w-full md:w-auto`}
          >
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConvo}
              loading={loading}
            />
          </div>

          {/* Chat */}
          <div
            className={`${
              mobileView === "chat" ? "flex" : "hidden"
            } md:flex flex-1 flex-col min-w-0`}
          >
            {activeId && activeConvo ? (
              <ChatWindow
                conversationId={activeId}
                participantName={getParticipantName(activeConvo)}
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