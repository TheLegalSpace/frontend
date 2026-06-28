"use client";

import {
  FileText,
  MessageSquare,
  AlertTriangle,
  ShieldAlert,
  UserPlus,
  Star,
  CheckCircle,
  XCircle,
  Bell,
  BookOpen,
  Calendar,
} from "lucide-react";
import { Notification, NotificationType } from "@/app/types/notification";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getNotificationMeta(type: NotificationType): {
  icon: React.ReactNode;
  label: string;
} {
  switch (type) {
    case "new_article":
      return { icon: <FileText size={15} />, label: "New Article" };
    case "new_message":
      return { icon: <MessageSquare size={15} />, label: "New Message" };
    case "chat_expiry_warning":
      return {
        icon: <AlertTriangle size={15} />,
        label: "Chat Expiry Warning",
      };
    case "daily_chat_limit":
      return {
        icon: <ShieldAlert size={15} />,
        label: "Daily Chat Limit Reached",
      };
    case "new_follower":
      return { icon: <UserPlus size={15} />, label: "New Follower" };
    case "new_review":
      return { icon: <Star size={15} />, label: "New Review" };
    case "request_accepted":
      return { icon: <CheckCircle size={15} />, label: "Request Accepted" };
    case "request_declined":
      return { icon: <XCircle size={15} />, label: "Request Declined" };
    default:
      return { icon: <Bell size={15} />, label: "Notification" };
  }
}

function ArticlePreview({
  article,
}: {
  article: NonNullable<Notification["payload"]["article"]>;
}) {
  return (
    <a
      href={`/articles/${article.slug}`}
      className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-white transition"
    >
      <div className="w-12 h-12 rounded-lg bg-gray-900 flex flex-col items-center justify-center shrink-0">
        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
          Article
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 leading-snug truncate">
          {article.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={10} />
            {article.readCount} Reads
          </span>
          <span className="ml-auto text-blue-600 font-medium flex items-center gap-1">
            <FileText size={10} />
            Read Article
          </span>
        </div>
      </div>
    </a>
  );
}

function getBodyText(notif: Notification): {
  primary: string | React.ReactNode;
  secondary?: string;
} {
  const actor = notif.payload.actorName;

  switch (notif.type) {
    case "new_article":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> has
            published a new article.
          </>
        ),
        secondary:
          "Stay informed with insights that may be relevant to your situation.",
      };
    case "new_message":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> has
            responded to your request.
          </>
        ),
        secondary:
          "Open the conversation to review their message and continue when you're ready.",
      };
    case "chat_expiry_warning":
      return {
        primary:
          "If you don't engage in a conversation for 7 days, it will be deleted. Keep chatting to keep it alive!",
      };
    case "daily_chat_limit":
      return {
        primary: "You've hit your daily limit for starting new conversations.",
        secondary:
          "You can chat with up to 3 lawyers each day to prevent spam requests. Feel free to continue your existing chats or try again tomorrow.",
      };
    case "new_follower":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> started
            following you.
          </>
        ),
      };
    case "new_review":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> left you
            a review.
          </>
        ),
      };
    case "request_accepted":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> accepted
            your request.
          </>
        ),
        secondary: "You can now start a conversation with them.",
      };
    case "request_declined":
      return {
        primary: (
          <>
            <span className="text-blue-600 font-medium">{actor}</span> declined
            your request.
          </>
        ),
      };
    default:
      return {
        primary: notif.payload.message ?? "You have a new notification.",
      };
  }
}

interface Props {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export default function NotificationCard({ notification, onMarkRead }: Props) {
  const { icon, label } = getNotificationMeta(notification.type);
  const { primary, secondary } = getBodyText(notification);
  const isUnread = !notification.readAt;

  function handleClick() {
    if (isUnread) onMarkRead(notification.id);
  }

  return (
    <div
      onClick={handleClick}
      className={`relative px-4 md:px-5 py-4 cursor-pointer transition hover:bg-white/60 ${
        isUnread ? "bg-white" : "bg-white/30"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          {isUnread && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-0.5" />
          )}
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-900">
            {icon}
            {label}
          </span>
        </div>
        <span className="text-[11px] text-gray-400 shrink-0">
          {timeAgo(notification.createdAt)}
        </span>
      </div>

      {/* Body */}
      <div className="text-[13px] text-gray-600 leading-relaxed">
        <p>{primary}</p>
        {secondary && <p className="mt-0.5 text-gray-500">{secondary}</p>}
      </div>

      {/* Article preview */}
      {notification.payload.article && (
        <ArticlePreview article={notification.payload.article} />
      )}

      {/* Full-width divider — breaks out of px padding */}
      <span className="absolute bottom-0 left-0 right-0 h-px bg-[#E5E7EB]" />
    </div>
  );
}