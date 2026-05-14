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

  const loadConversations = useCallback(async () => {
    try {
      const data = await messagesService.getConversations();
      const items: Conversation[] = data?.data?.items ?? data?.data ?? [];
      setConversations(items);
      // Auto-select first on initial load
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

    // Lawyer accepted a match → new conversation created
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
          loadConversations(); // refresh sidebar
          setActiveId(conversationId); // auto-open the new convo
        }
      }
    );

    // Conversation closed by the other party
    socket.on("conversation:updated", (conv: { id: string; status: string }) => {
      if (conv.status === "closed") {
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, status: "closed" } : c))
        );
      }
    });

    // Token expired — reconnect
    socket.on("connect_error", (err: { message: string; }) => {
      if (err.message === "invalid token") {
        const newToken = localStorage.getItem("accessToken") ?? "";
        disconnectSocket();
        connectSocket(newToken);
      }
    });

    // On reconnect, backfill in case we missed anything
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-2xl overflow-hidden flex h-150 shadow-sm">
        {/* Sidebar */}
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          loading={loading}
        />

        {/* Chat area */}
        {activeId && activeConvo ? (
          <ChatWindow
            conversationId={activeId}
            participantName={activeConvo.otherParty.name}
            currentAccountId={user?.id ?? ""}
            isAnonymous={isAnonymous}
            onAnonymousToggle={setIsAnonymous}
            onClose={() => {}}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <MessageSquare size={32} strokeWidth={1.5} />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}