"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";
import { connectSocket, disconnectSocket } from "@/services/socket.services";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import { useAuth } from "@/app/context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);

  // On mobile, track whether we're showing the chat or the list
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const loadConversations = useCallback(async () => {
    try {
      const data = await messagesService.getConversations();
      const items: Conversation[] = data?.data?.items ?? data?.data ?? [];
      setConversations(items);
      // Only auto-select on desktop (don't push mobile to chat view on load)
      if (items.length > 0 && !activeId) {
        setActiveId(items[0].id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

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

    socket.on("conversation:updated", (conv: { id: string; status: string }) => {
      if (conv.status === "closed") {
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, status: "closed" } : c))
        );
      }
    });

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
      socket.off("connect_error");
      socket.off("connect");
    };
  }, [loadConversations]);

  const activeConvo = conversations.find((c) => c.id === activeId) ?? null;

  function handleSelectConvo(id: string) {
    setActiveId(id);
    setMobileView("chat"); // push to chat view on mobile
  }

  function handleBackToList() {
    setMobileView("list"); // back button on mobile
  }

  return (
    <div className="min-h-screen bg-gray-50 md:flex md:items-start md:justify-center md:py-8 md:px-4">
      <div className="w-full md:max-w-4xl bg-white md:border md:border-gray-200 md:rounded-2xl overflow-hidden md:flex md:h-150 md:shadow-sm h-screen flex flex-col">

        {/* ── Mobile: show list OR chat, never both ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar — always visible on md+, conditionally on mobile */}
          <div className={`
            ${mobileView === "list" ? "flex" : "hidden"}
            md:flex flex-col w-full md:w-auto
          `}>
            <ConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelectConvo}
              loading={loading}
            />
          </div>

          {/* Chat — always visible on md+ if active, conditionally on mobile */}
          <div className={`
            ${mobileView === "chat" ? "flex" : "hidden"}
            md:flex flex-1 flex-col min-w-0
          `}>
            {activeId && activeConvo ? (
              <ChatWindow
                conversationId={activeId}
                participantName={activeConvo.otherParty?.fullName ?? "Unknown"}
                currentAccountId={user?.id ?? ""}
                isAnonymous={isAnonymous}
                onAnonymousToggle={setIsAnonymous}
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