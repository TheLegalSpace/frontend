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

  // isAnonymous for the CLIENT side only.
  // null = not yet loaded (so we don't flash the wrong banner).
  // For lawyers, this state is never used — ChatWindow reads otherParty directly.
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  const searchParams = useSearchParams();

  // Ref so socket/effect closures always see the latest list
  // without stale captures causing duplicate entries.
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
  }, []);

  /** Re-fetch a single conversation and update it in the list */
  const refreshConversation = useCallback(async (id: string) => {
    try {
      const data = await messagesService.getConversation(id);
      const convo: Conversation = data?.data ?? data;
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
  // Uses conversationsRef (not state) so this effect only re-runs when
  // searchParams changes — avoiding duplicate prepends on every list update.
  useEffect(() => {
    const id = searchParams.get("conversation");
    if (!id) return;

    setActiveId(id);
    setMobileView("chat");

    const alreadyLoaded = conversationsRef.current.find((c) => c.id === id);
    if (alreadyLoaded) return;

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
  }, [searchParams]);

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

          // FIX: Instead of calling loadConversations() (which re-fetches
          // the full list and can re-add an already-present conversation),
          // we fetch only this one conversation and upsert it.
          // This prevents the duplicate-entry bug where the same conversation
          // appears multiple times after a lead is accepted.
          messagesService
            .getConversation(conversationId)
            .then((data) => {
              const convo: Conversation = data?.data ?? data;
              if (!convo?.id) return;
              setConversations((prev) => {
                if (prev.find((c) => c.id === convo.id)) {
                  // Already present — just refresh it in place
                  return prev.map((c) => (c.id === convo.id ? convo : c));
                }
                return [convo, ...prev];
              });
            })
            .catch(() => {
              // Fallback: full reload if single-fetch fails
              loadConversations();
            });

          setActiveId(conversationId);
          setMobileView("chat");
        }
      }
    );

    socket.on(
      "conversation:updated",
      (conv: { id: string; status?: string; isAnonymous?: boolean }) => {
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
      // On reconnect, do a full refresh to catch anything missed while offline.
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
      refreshConversation(activeId);
    }
  }, [activeId, activeConvo, refreshConversation]);

  // ── Sync isAnonymous from the active conversation (client only) ────────────
  // Priority:
  //   1. Locally stored value (survives refresh)
  //   2. myParticipant.isAnonymous from the API
  //   3. Root-level isAnonymous on the conversation object
  //   4. null (still loading)
  useEffect(() => {
    if (isLawyer) return;
    if (!activeId) return;

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
      setIsAnonymous(serverValue);
      storeAnonymous(activeId, role, serverValue);
    }
  }, [activeConvo, activeId, isLawyer, user?.role]);

  // ── Conversation selection ─────────────────────────────────────────────────
  function handleSelectConvo(id: string) {
    setActiveId(id);
    setMobileView("chat");

    if (!isLawyer) {
      const stored = getStoredAnonymous(id, user?.role ?? "client");
      setIsAnonymous(stored); // null if never stored; syncs from convo data below
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

  // ── Resolve isAnonymous for the active chat ────────────────────────────────
  //
  // LAWYER: reads otherParty.isAnonymous from the conversation object.
  //         Lawyers never have their own identity hidden — they're always
  //         visible to the client. This value only controls whether the
  //         client has revealed themselves TO the lawyer.
  //
  // CLIENT: reads from local state (which is seeded from localStorage on
  //         selection and synced from the server above).
  //         Defaults to `true` (anonymous) while loading so we never
  //         accidentally flash the revealed state before data arrives.
  const activeIsAnonymous = isLawyer
    ? (activeConvo?.otherParty?.isAnonymous ?? true)
    : (isAnonymous ?? true);

  // ── Derive participant name safely ─────────────────────────────────────────
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