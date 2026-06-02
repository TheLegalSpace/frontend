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

  // On mobile, track whether we're showing the chat or the list
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

  useEffect(() => {
    if (conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  // Page-level socket events
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
              loading={conversationsQuery.isLoading}
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
