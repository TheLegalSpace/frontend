"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, disconnectSocket } from "@/services/socket.services";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useAuth } from "@/app/context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const isLawyer = user?.role === "LAWYER";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // isAnonymous for the CLIENT: initialized as null until we know the real value
  // from the conversation data. null = "not yet loaded" so we don't flash the banner.
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);

  const searchParams = useSearchParams();

  const loadConversations = useCallback(async () => {
    try {
      const data = await messagesService.getConversations();
      const items: Conversation[] = data?.data?.items ?? data?.data ?? [];
      setConversations(items);
      if (items.length > 0 && !activeId) {
        setActiveId(items[0].id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

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

  useEffect(() => {
    const id = searchParams.get("conversation");
    if (!id) return;
    setActiveId(id);
    setMobileView("chat");
    const alreadyLoaded = conversations.find((c) => c.id === id);
    if (!alreadyLoaded) {
      messagesService.getConversation(id).then((data) => {
        const convo: Conversation = data?.data ?? data;
        if (convo?.id) {
          setConversations((prev) => {
            if (prev.find((c) => c.id === convo.id)) return prev;
            return [convo, ...prev];
          });
        }
      }).catch(console.error);
    }
  }, [searchParams, conversations]);

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Page-level socket events
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
            prev.map((c) => (c.id === conv.id ? { ...c, status: "closed" } : c))
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

  // If the active conversation has no otherParty data, re-fetch it
  useEffect(() => {
    if (activeId && activeConvo && !activeConvo.otherParty?.fullName) {
      console.log("[MessagesPage] otherParty missing, re-fetching conversation:", activeId);
      refreshConversation(activeId);
    }
  }, [activeId, activeConvo, refreshConversation]);

  // Sync isAnonymous from the active conversation's own participant data.
  // The API returns the client's own anonymity state via `myParticipant.isAnonymous`
  // (or equivalent). Fall back to `otherParty.isAnonymous` if that's what the shape is.
  // We only do this for clients — lawyers read the OTHER party's isAnonymous separately.
  useEffect(() => {
    if (isLawyer) return;
    if (!activeConvo) return;

    // Prefer `myParticipant` if the API exposes it, otherwise read from the
    // conversation's own `isAnonymous` field (some backends put it at the root).
    const serverValue =
      (activeConvo as unknown as { myParticipant?: { isAnonymous: boolean } })
        .myParticipant?.isAnonymous ??
      (activeConvo as unknown as { isAnonymous?: boolean }).isAnonymous;

    if (typeof serverValue === "boolean") {
      console.log("[MessagesPage] syncing isAnonymous from conversation:", serverValue);
      setIsAnonymous(serverValue);
    }
  }, [activeConvo, isLawyer]);

  function handleSelectConvo(id: string) {
    setActiveId(id);
    setMobileView("chat");
    // Reset anonymous state when switching conversations so we re-sync
    // from the newly active conversation's data rather than keeping stale state.
    if (!isLawyer) setIsAnonymous(null);
  }

  function handleBackToList() {
    setMobileView("list");
  }

  function handleConversationClosed() {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, status: "closed" } : c))
    );
  }

  /** Called by client's AnonymousBanner after successful API call */
  function handleAnonymousToggle(val: boolean) {
    setIsAnonymous(val);
    if (activeId) {
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
  // so we don't flash the "revealed" state before data arrives.
  const activeIsAnonymous = isLawyer
    ? (activeConvo?.otherParty?.isAnonymous ?? true)
    : (isAnonymous ?? true);

  return (
    <div className="min-h-screen bg-gray-50 md:flex md:items-start md:justify-center md:py-8 md:px-4">
      <div className="w-full md:max-w-4xl bg-white md:border md:border-gray-200 md:rounded-2xl overflow-hidden md:flex md:h-150 md:shadow-sm h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div
            className={`${mobileView === "list" ? "flex" : "hidden"} md:flex flex-col w-full md:w-auto`}
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
            className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 flex-col min-w-0`}
          >
            {activeId && activeConvo ? (
              <ChatWindow
                conversationId={activeId}
                participantName={
                  activeConvo.otherParty?.isAnonymous
                    ? "Anonymous User"
                    : (activeConvo.otherParty?.fullName || "Loading...")
                }
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