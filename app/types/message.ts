export interface Participant {
    id: string;
    name: string;
    avatarUrl?: string;
}
export interface Conversation {
    id: string;
    participant: Participant;
    lastMessage: string;
    lastMessageAt: string;
    status: "open" | "closed";
    unread?: number
}
export interface Message {
    id: string;
    conversationId: string;
    senderAccountId: string;
    body: string;
    createdAt: string;
    readAt?: string | null;
}