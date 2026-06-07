"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Pin,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronDown,
  LogOut,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { ResearchThread } from "@/app/types/Research";

interface Props {
  threads: ResearchThread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onBack?: () => void;
  loading: boolean;
}

export default function ResearchSidebar({
  threads,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onPin,
  onBack,
  loading,
}: Props) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);
  const [pastOpen, setPastOpen] = useState(true);
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const filtered = threads.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter((t) => t.pinned);
  const unpinned = filtered.filter((t) => !t.pinned);

  function startEdit(t: ResearchThread) {
    setEditingId(t.id);
    setEditValue(t.title);
    setMenuId(null);
  }

  async function commitEdit(id: string) {
    const val = editValue.trim();
    if (val && val.length <= 120) onRename(id, val);
    setEditingId(null);
  }

  function ThreadItem({ thread }: { thread: ResearchThread }) {
    const isActive = thread.id === activeId;
    const isEditing = editingId === thread.id;
    const isMenu = menuId === thread.id;
  
    return (
      <div className="relative group">
        {/* Changed outer button → div with onClick */}
        <div
          onClick={() => { if (!isEditing) { onSelect(thread.id); setMenuId(null); } }}
          className={`w-full text-left px-4 py-2.5 text-[14px] flex items-center gap-2 transition-all border-l-2 cursor-pointer ${
            isActive
              ? "border-l-blue-500 text-gray-900 font-medium bg-transparent"
              : "border-l-transparent text-gray-700 hover:bg-gray-50"
          }`}
        >
          {thread.pinned && (
            <Pin size={10} className="shrink-0 text-gray-400" />
          )}
  
          {isEditing ? (
            <input
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit(thread.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-gray-100 text-gray-900 text-[13px] rounded px-1.5 py-0.5 outline-none min-w-0 border border-gray-300"
              maxLength={120}
            />
          ) : (
            <span className="flex-1 truncate">{thread.title}</span>
          )}
  
          {isEditing ? (
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => commitEdit(thread.id)} className="text-green-600 hover:text-green-500">
                <Check size={13} />
              </button>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setMenuId(isMenu ? null : thread.id); }}
              className="shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
            >
              <span className="text-gray-400 text-[16px] leading-none">···</span>
            </button>
          )}
        </div>
  
        {/* Context menu */}
        {isMenu && !isEditing && (
          <div className="absolute right-2 top-9 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40">
            <button
              onClick={() => { onPin(thread.id, !thread.pinned); setMenuId(null); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 transition"
            >
              <Pin size={12} />
              {thread.pinned ? "Unpin" : "Pin research"}
            </button>
            <button
              onClick={() => startEdit(thread)}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 transition"
            >
              <Pencil size={12} />
              Rename
            </button>
            <button
              onClick={() => { onDelete(thread.id); setMenuId(null); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full bg-white text-gray-900"
      onClick={() => setMenuId(null)}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <ArrowLeft size={15} className="text-gray-500" />
          </button>
        )}
        <span className="text-[16px] font-semibold text-gray-900">
          TLS Research
        </span>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-300"
          />
        </div>
      </div>

      {/* New Chat */}
      <div className="px-4 pb-3">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-gray-500" />
            New Chat
          </div>
          <Plus size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto pb-4">
        {loading ? (
          <div className="text-[12px] text-gray-400 text-center py-6">Loading…</div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-2">
                <p className="text-[11px] uppercase tracking-widest text-gray-400 px-4 mb-1">Pinned</p>
                <div className="flex flex-col">
                  {pinned.map((t) => <ThreadItem key={t.id} thread={t} />)}
                </div>
              </div>
            )}

            {unpinned.length > 0 && (
              <div>
                <button
                  onClick={() => setPastOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 mb-1"
                >
                  <p className="text-[11px] uppercase tracking-widest text-gray-400">Past Research</p>
                  <ChevronDown
                    size={13}
                    className={`text-gray-400 transition-transform ${pastOpen ? "" : "-rotate-90"}`}
                  />
                </button>
                {pastOpen && (
                  <div className="flex flex-col">
                    {unpinned.map((t) => <ThreadItem key={t.id} thread={t} />)}
                  </div>
                )}
              </div>
            )}

            {threads.length === 0 && !loading && (
              <p className="text-[13px] text-gray-400 text-center py-6">No research yet</p>
            )}
          </>
        )}
      </div>

      {/* Logout */}
      <div className="px-4 pb-5 pt-3">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-full border border-gray-200 text-[13px] text-red-400 hover:bg-red-50 transition">
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
}