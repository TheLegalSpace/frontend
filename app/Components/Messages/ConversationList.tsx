"use client"

import { Search } from "lucide-react"
import { Conversation } from "@/app/types/message"

function getInitials(name:string) {
    if(!name) return "??";
    return name.split(" ")
           .map((n) => n[0])
           .join("")
           .slice(0, 2)
           .toUpperCase();
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;   
}

const AVATAR_COLORS: Record<number, string> = {
  0: "bg-blue-100 text-blue-800",
  1: "bg-purple-100 text-purple-800",
  2: "bg-green-100 text-green-800",
  3: "bg-amber-100 text-amber-800",
  4: "bg-pink-100 text-pink-800",
};
 
function avatarColor(name: string) {
  const code = name.charCodeAt(0) % 5;
  return AVATAR_COLORS[code] ?? AVATAR_COLORS[0];
}

interface Props {
    conversations: Conversation[];
    activeId: string | null;
    onSelect: (id: string) => void;
    loading: boolean;
}

export default function ConversationList({conversations, activeId, onSelect, loading}: Props) {
    return (
    <div className="w-55 min-w-55 border-r border-gray-200 flex flex-col bg-white h-full">
      <div className="px-4 pt-4 pb-2 text-[15px] font-semibold text-gray-900">
        Messages
      </div>
 
      {/* Search */}
      <div className="px-3 pb-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg outline-none focus:border-gray-300 placeholder:text-gray-400"
          />
        </div>
      </div>
 
      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-sm text-gray-400 text-center">
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-6 text-sm text-gray-400 text-center">
            No conversations yet.
          </div>
        ) : (
          conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => onSelect(convo.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-100 hover:bg-gray-50 transition text-left ${
                activeId === convo.id ? "bg-gray-100" : ""
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(
                  convo.participant.name
                )}`}
              >
                {convo.participant.avatarUrl ? (
                  <img
                    src={convo.participant.avatarUrl}
                    alt={convo.participant.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(convo.participant.name)
                )}
              </div>
 
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-gray-900 truncate">
                    {convo.participant.name}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0 ml-1">
                    {timeAgo(convo.lastMessageAt)}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 truncate mt-0.5">
                  {convo.lastMessage}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}