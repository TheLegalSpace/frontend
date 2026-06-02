"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, refreshSocketAuth } from "@/services/socket.services";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useAuth } from "@/app/context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function MessagesPage() {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const queryClient = useQueryClient();
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/app/types/message";
import { connectSocket, disconnectSocket } from "@/services/socket.services";
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
// ─────────────────────────────────────────────────────────────────────────────

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

  // isAnonymous for the CLIENT side only.
  // Seeded from user.isAnonymous (their profile setting) so it's correct
  // immediately on mount — no waiting for a conversation fetch.
  // For lawyers this state is never used; ChatWindow reads otherParty directly.
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(() =>
    user?.isAnonymous != null ? Boolean(user.isAnonymous) : null,
  );

  // Ref so socket/effect closures always see the latest list
  // without stale captures causing duplicate entries.
  const conversationsRef = useRef<Conversation[]>([]);
  conversationsRef.current = conversations;

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const data = await messagesService.getConversations();
      return (data?.data?.items ?? data?.data ?? []) as Conversation[];
    },
    staleTime: 1000 * 30,
  });

  const conversations = useMemo(
    () => conversationsQuery.data ?? [],
    [conversationsQuery.data]
  );
  // Auto-select the first conversation once we have data
  useEffect(() => {
    setActiveId((prev) => {
      if (prev) return prev;
      return conversations.length > 0 ? conversations[0].id : null;
    });
  }, [conversations]);

  // ── Handle ?conversation= query param ──────────────────────────────────────
  // Uses conversationsRef (not state) so this effect only re-runs when
  // searchParams changes — avoiding duplicate prepends on every list update.
  useEffect(() => {
    if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);
    const id = searchParams.get("conversation");
    if (!id) return;

    setActiveId(id);
    setMobileView("chat");

    const alreadyLoaded = conversationsRef.current.find((c) => c.id === id);
    if (alreadyLoaded) return;

    fetchAndUpsertConversation(id).catch(console.error);
  }, [searchParams, fetchAndUpsertConversation]);

  // ── Page-level socket events ───────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("accessToken") ?? "";
    const socket = connectSocket(token);

    const handleRequestStatusChanged = ({
      status,
      conversationId,
    }: {
      requestId: string;
      status: string;
      conversationId?: string;
    }) => {
      if (status === "accepted" && conversationId) {
        socket.emit("conversation:join", { conversationId });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        setActiveId(conversationId);
        setMobileView("chat");
      }
    };

    const handleConversationUpdated = (conv: {
      id: string;
      status: string;
      lastMessage?: string;
      lastMessageAt?: string;
    }) => {
      queryClient.setQueryData<Conversation[]>(["conversations"], (prev = []) =>
        prev.map((item) =>
          item.id === conv.id
            ? {
                ...item,
                status: conv.status === "closed" ? "closed" : item.status,
                lastMessage: conv.lastMessage ?? item.lastMessage,
                lastMessageAt: conv.lastMessageAt ?? item.lastMessageAt,
              }
            : item
        )
      );
    };
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
            // Fallback: list refetch
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

    const handleConnectError = (err: { message: string }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        refreshSocketAuth(newToken);
      }
    };

    const handleConnect = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("request:status_changed", handleRequestStatusChanged);
    socket.on("conversation:updated", handleConversationUpdated);
    socket.on("connect_error", handleConnectError);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("request:status_changed", handleRequestStatusChanged);
      socket.off("conversation:updated", handleConversationUpdated);
      socket.off("connect_error", handleConnectError);
      socket.off("connect", handleConnect);
    };
  }, [queryClient]);
    socket.on("connect", () => {
      // On reconnect, do a full refresh to catch anything missed while offline.
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

  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  // If the active conversation loaded without otherParty at all, re-fetch once.
  // We only trigger on the object being entirely absent — not on fullName being
  // empty, because anonymous users legitimately have no fullName and triggering
  // a refresh on that would create an infinite loop.
  useEffect(() => {
    if (activeId && activeConvo && !activeConvo.otherParty) {
      refreshConversation(activeId);
    }
  }, [activeId, activeConvo, refreshConversation]);

  // ── Sync isAnonymous (client only) ───────────────────────────────────────
  // Priority order:
  //   1. user.isAnonymous from AuthContext — profile-level setting, available
  //      immediately on mount. This is the primary source of truth.
  //   2. localStorage per-conversation override — written when the client
  //      clicks "Reveal My Identity" for a specific conversation.
  //   3. Conversation-level server value — fallback if neither above is set.
  //
  // We run this once when user loads and again when activeId changes so a
  // conversation-specific reveal doesn't bleed into a different conversation.
  useEffect(() => {
    if (isLawyer) return;

    // 1. Start from the profile-level setting
    const profileValue =
      user?.isAnonymous != null ? Boolean(user.isAnonymous) : null;

    if (!activeId) {
      // No conversation selected — just reflect the profile setting
      setIsAnonymous(profileValue);
      return;
    }

    // 2. Check for a per-conversation reveal stored in localStorage.
    //    A stored value of `false` means the client already revealed for this
    //    conversation, even if their profile is still set to anonymous.
    const role = user?.role ?? "client";
    const stored = getStoredAnonymous(activeId, role);
    if (stored !== null) {
      setIsAnonymous(stored);
      return;
    }

    // 3. Fall back to profile setting (or null if profile hasn't loaded yet)
    setIsAnonymous(profileValue);
  }, [activeId, isLawyer, user?.isAnonymous, user?.role]);

  // ── Conversation selection ─────────────────────────────────────────────────
  function handleSelectConvo(id: string) {
    setActiveId(id);
    setMobileView("chat");

    if (!isLawyer) {
      // Check for a conversation-specific reveal first; fall back to profile setting.
      // This prevents a revealed conversation from making another convo look revealed.
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

  /** Called by client's AnonymousBanner after a successful API call */
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

  // ── Resolve isAnonymous for the active chat ────────────────────────────────
  const activeIsAnonymous: boolean | null = isLawyer
    ? (activeConvo?.otherParty?.isAnonymous ?? null)
    : isAnonymous;

  // ── Derive participant name safely ─────────────────────────────────────────
  function getParticipantName(convo: Conversation): string {
    if (!convo.otherParty) return "Anonymous User";
    // Treat undefined/null/true all as anonymous — only explicit false means revealed
    if (convo.otherParty.isAnonymous !== false) return "Anonymous User";
    return convo.otherParty.fullName || "Anonymous User";
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
              loading={conversationsQuery.isLoading}
              loading={isLoading}
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
