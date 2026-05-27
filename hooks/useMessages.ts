import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Conversation, Message } from "@/app/types/message";
import { messagesService } from "@/services/messages.services";

export const conversationKeys = {
  all: ["conversations"] as const,
  lists: () => [...conversationKeys.all, "list"] as const,
  list: (page = 1, limit = 20) =>
    [...conversationKeys.lists(), page, limit] as const,
  details: () => [...conversationKeys.all, "detail"] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
};

export const messageKeys = {
  all: ["messages"] as const,
  list: (conversationId: string) =>
    [...messageKeys.all, conversationId] as const,
};

function parseConversations(data: unknown): Conversation[] {
  const payload = data as { data?: { items?: Conversation[] } | Conversation[] };
  return payload?.data?.items ?? payload?.data ?? [];
}

function parseConversation(data: unknown): Conversation {
  const payload = data as { data?: Conversation };
  return payload?.data ?? (payload as Conversation);
}

function parseMessages(data: unknown): Message[] {
  const payload = data as { data?: { items?: Message[] } | Message[] };
  const items = payload?.data?.items ?? payload?.data ?? [];
  return [...items].reverse();
}

export function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const temps = existing.filter(
    (m) => m.id.startsWith("temp-") && !incoming.some((r) => r.body === m.body),
  );
  const merged = [...incoming, ...temps];
  merged.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  return merged;
}

export function useConversations(page = 1, limit = 20) {
  return useQuery({
    queryKey: conversationKeys.list(page, limit),
    queryFn: async () => {
      const data = await messagesService.getConversations(page, limit);
      return parseConversations(data);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useConversation(id: string | null, enabled = true) {
  return useQuery({
    queryKey: conversationKeys.detail(id ?? ""),
    queryFn: async () => {
      const data = await messagesService.getConversation(id!);
      return parseConversation(data);
    },
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMessages(
  conversationId: string,
  options?: { refetchInterval?: number | false; enabled?: boolean },
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: messageKeys.list(conversationId),
    queryFn: async () => {
      const data = await messagesService.getMessages(conversationId);
      const fresh = parseMessages(data);
      const prev =
        queryClient.getQueryData<Message[]>(
          messageKeys.list(conversationId),
        ) ?? [];
      return mergeMessages(prev, fresh);
    },
    enabled: options?.enabled ?? !!conversationId,
    staleTime: 1000 * 60 * 2,
    refetchInterval: options?.refetchInterval,
  });
}

export function useConversationCache() {
  const queryClient = useQueryClient();

  const upsertConversation = useCallback(
    (convo: Conversation) => {
      // Update any cached conversation lists (any page/limit)
      queryClient.setQueriesData<Conversation[]>(
        { queryKey: conversationKeys.lists() },
        (prev = []) => {
          if (prev.find((c) => c.id === convo.id)) {
            return prev.map((c) => (c.id === convo.id ? convo : c));
          }
          return [convo, ...prev];
        },
      );

      queryClient.setQueryData(conversationKeys.detail(convo.id), convo);
    },
    [queryClient],
  );

  const patchConversation = useCallback(
    (id: string, patch: Partial<Conversation>) => {
      queryClient.setQueriesData<Conversation[]>(
        { queryKey: conversationKeys.lists() },
        (prev = []) =>
          prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      );

      queryClient.setQueryData<Conversation>(
        conversationKeys.detail(id),
        (prev) => (prev ? { ...prev, ...patch } : prev),
      );
    },
    [queryClient],
  );

  const refreshConversation = useCallback(
    async (id: string) => {
      const data = await messagesService.getConversation(id);
      const convo = parseConversation(data);
      if (convo?.id) upsertConversation(convo);
    },
    [upsertConversation],
  );

  const fetchAndUpsertConversation = useCallback(
    async (id: string) => {
      const data = await queryClient.fetchQuery({
        queryKey: conversationKeys.detail(id),
        queryFn: async () => {
          const response = await messagesService.getConversation(id);
          return parseConversation(response);
        },
        staleTime: 1000 * 60 * 2,
      });
      if (data?.id) upsertConversation(data);
      return data;
    },
    [queryClient, upsertConversation],
  );

  const invalidateConversations = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
  }, [queryClient]);

  return {
    upsertConversation,
    patchConversation,
    refreshConversation,
    fetchAndUpsertConversation,
    invalidateConversations,
  };
}

export function useMessageCache(conversationId: string) {
  const queryClient = useQueryClient();
  const key = messageKeys.list(conversationId);

  const setMessages = useCallback(
    (updater: (prev: Message[]) => Message[]) => {
      queryClient.setQueryData<Message[]>(key, (prev = []) => updater(prev));
    },
    [queryClient, key],
  );

  const appendMessage = useCallback(
    (msg: Message) => {
      setMessages((prev) => {
        const withoutTemp = prev.filter(
          (m) => !(m.id.startsWith("temp-") && m.body === msg.body),
        );
        if (withoutTemp.find((m) => m.id === msg.id)) return withoutTemp;
        return [...withoutTemp, msg];
      });
    },
    [setMessages],
  );

  const markMessageRead = useCallback(
    (messageId: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, readAt: new Date().toISOString() } : m,
        ),
      );
    },
    [setMessages],
  );

  return { setMessages, appendMessage, markMessageRead };
}
