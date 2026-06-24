"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pin, Trash2 } from "lucide-react";
import {
  ResearchThread,
  ResearchMessage,
  ResearchThreadDetail,
} from "@/app/types/Research";
import { researchService } from "@/services/Research.services";
import ResearchSidebar from "./Researchsidebar";
import MessageList from "./Messagelist";
import ResearchComposer from "./Researchcomposer";
import ResearchLanding from "./Researchlanding";

type ErrorState = { message: string; onRetry: () => void } | null;

/** Sentinel id for a thread that exists only in the UI and has NOT been
 *  registered on the backend yet. It becomes a real thread on first send. */
const DRAFT_ID = "__draft__";

/** Tell the dashboard Sidebar whether the research thread view is active */
function signalResearchThread(active: boolean) {
  window.dispatchEvent(
    new CustomEvent("research:thread", { detail: { active } }),
  );
}

export default function TLSResearchPage() {
  const [threads, setThreads] = useState<ResearchThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [activeThread, setActiveThread] = useState<ResearchThreadDetail | null>(
    null,
  );
  const [messages, setMessages] = useState<ResearchMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [error, setError] = useState<ErrorState>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load sidebar ──────────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      const data = await researchService.listThreads();
      if (isMountedRef.current) {
        setThreads(data);
      }
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingThreads(false);
      }
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // ── Open a thread ─────────────────────────────────────────────────────────
  const openThread = useCallback(async (id: string) => {
    setActiveId(id);
    activeIdRef.current = id;
    setError(null);
    setLoadingMessages(true);
    setMessages([]);
    setMobileView("chat");
    try {
      const detail = await researchService.getThread(id);
      if (activeIdRef.current === id && isMountedRef.current) {
        setActiveThread(detail);
        setMessages(detail.messages);
      }
    } catch (err) {
      console.error("Failed to open thread:", err);
    } finally {
      if (activeIdRef.current === id && isMountedRef.current) {
        setLoadingMessages(false);
      }
    }
  }, []);

  // ── New thread (DRAFT ONLY) ───────────────────────────────────────────────
  // Creates the thread *visually* only. It is NOT registered on the backend
  // until the first message is actually sent (see persistAndSend).
  function startDraft() {
    const now = new Date().toISOString();
    const draft: ResearchThreadDetail = {
      id: DRAFT_ID,
      accountId: "",
      title: "New research",
      pinned: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      messages: [],
    };
    setActiveId(DRAFT_ID);
    activeIdRef.current = DRAFT_ID;
    setActiveThread(draft);
    setMessages([]);
    setError(null);
    setMobileView("chat");
  }

  // ── Persist the draft on the FIRST message, then send it ──────────────────
  async function persistAndSend(text: string, pdf?: File) {
    setError(null);
    let thread: ResearchThread;
    try {
      thread = await researchService.createThread();
    } catch (err) {
      console.error("Failed to create thread:", err);
      if (isMountedRef.current) {
        setError({
          message: "Couldn't start a new research thread. Please try again.",
          onRetry: () => persistAndSend(text, pdf),
        });
      }
      return;
    }
    if (!isMountedRef.current) return;
    // Promote the visual draft into a real, registered thread.
    setThreads((prev) => [thread, ...prev]);
    setActiveId(thread.id);
    activeIdRef.current = thread.id;
    setActiveThread({ ...thread, messages: [] });
    setMessages([]);
    setMobileView("chat");
    await doSend(thread.id, text, pdf);
  }

  // ── Core send ─────────────────────────────────────────────────────────────
  async function doSend(threadId: string, text: string, pdf?: File) {
    setError(null);
    setThinking(true);
    setPendingPdf(pdf ?? null);

    // Optimistic user message
    const optimisticUser: ResearchMessage = {
      id: `temp-${Date.now()}`,
      threadId,
      role: "user",
      content: text,
      attachments: pdf
        ? [{ kind: "pdf", url: "", filename: pdf.name, sizeBytes: pdf.size }]
        : null,
      sources: null,
      confident: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const assistant = await researchService.ask(threadId, text, pdf);
      
      if (activeIdRef.current !== threadId) {
        // Active thread changed, do not leak this query response to the new thread's UI messages state.
        // But refresh sidebar if needed (e.g. name of new thread created)
        const currentThread = threads.find((t) => t.id === threadId);
        if (!currentThread || currentThread.title === "New research") {
          await loadThreads();
        }
        return;
      }

      if (isMountedRef.current) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => m.id !== optimisticUser.id);
          return [
            ...withoutTemp,
            { ...optimisticUser, id: `user-${Date.now()}` },
            assistant,
          ];
        });

        // Refresh sidebar title if this was the first message
        const currentThread = threads.find((t) => t.id === threadId);
        if (!currentThread || currentThread.title === "New research") {
          await loadThreads();
        }
      }
    } catch (err: any) {
      if (activeIdRef.current === threadId && isMountedRef.current) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
        if (err?.status === 503) {
          setError({
            message:
              err.message || "Legal-source search is temporarily unavailable.",
            onRetry: () => doSend(threadId, text, pdf),
          });
        } else if (err?.status === 429) {
          setError({
            message: "You're sending questions too fast — wait a moment.",
            onRetry: () => doSend(threadId, text, pdf),
          });
        } else {
          setError({
            message: err?.message || "Something went wrong.",
            onRetry: () => doSend(threadId, text, pdf),
          });
        }
      }
    } finally {
      if (activeIdRef.current === threadId && isMountedRef.current) {
        setThinking(false);
        setPendingPdf(null);
      }
    }
  }

  function handleSend(text: string, pdf?: File) {
    // No active thread, or an unsaved draft → register on the backend now,
    // as part of sending the first message.
    if (!activeId || activeId === DRAFT_ID) {
      persistAndSend(text, pdf);
      return;
    }
    doSend(activeId, text, pdf);
  }

  const isThreadActive = !!activeId && !!activeThread;
  // ── Signal sidebar hide/show based on thread active state ───────────────
  useEffect(() => {
    signalResearchThread(isThreadActive);
    return () => signalResearchThread(false); // cleanup on unmount
  }, [isThreadActive]);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // ── Sidebar actions ───────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    if (id === DRAFT_ID) {
      // Draft was never registered — just discard it locally.
      if (activeIdRef.current === DRAFT_ID) {
        setActiveId(null);
        activeIdRef.current = null;
        setMessages([]);
        setActiveThread(null);
        setMobileView("sidebar");
      }
      return;
    }
    await researchService.deleteThread(id);
    if (!isMountedRef.current) return;
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeIdRef.current === id) {
      setActiveId(null);
      activeIdRef.current = null;
      setMessages([]);
      setActiveThread(null);
      setMobileView("sidebar");
    }
  }

  async function handleRename(id: string, title: string) {
    if (id === DRAFT_ID) return; // not registered yet — nothing to rename
    const updated = await researchService.patchThread(id, { title });
    if (!isMountedRef.current) return;
    setThreads((prev) => prev.map((t) => (t.id === id ? updated : t)));
    if (activeIdRef.current === id && activeThread) {
      setActiveThread({ ...activeThread, title });
    }
  }

  async function handlePin(id: string, pinned: boolean) {
    if (id === DRAFT_ID) return; // not registered yet — nothing to pin
    const updated = await researchService.patchThread(id, { pinned });
    if (!isMountedRef.current) return;
    setThreads((prev) =>
      [...prev.map((t) => (t.id === id ? updated : t))].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }),
    );
  }

  // ── Landing suggestion ────────────────────────────────────────────────────
  function handleSuggestion(text: string) {
    // A suggestion IS the first message → register the thread as we send.
    persistAndSend(text);
  }

  // ── Landing: always shown when no thread is active ───────────────────────
  if (!isThreadActive) {
    return (
      <div className="flex h-screen bg-white overflow-hidden font-['Geist']">
        <ResearchLanding
          onSuggestion={handleSuggestion}
          onNewThread={startDraft}
          onUploadAndNew={startDraft}
        />
      </div>
    );
  }

  // ── Thread view: sidebar + chat ───────────────────────────────────────────
  return (
    <div className="flex h-screen bg-white overflow-hidden font-['Geist']">
      {/* Sidebar — hidden on mobile when viewing chat */}
      <div
        className={`${
          mobileView === "chat" ? "hidden" : "flex"
        } md:flex flex-col w-full md:w-56 md:min-w-56 shrink-0 border-r border-gray-800`}
      >
        <ResearchSidebar
          threads={threads}
          activeId={activeId}
          onSelect={openThread}
          onNew={startDraft}
          onDelete={handleDelete}
          onRename={handleRename}
          onPin={handlePin}
          loading={loadingThreads}
          onBack={() => setMobileView("sidebar")}
        />
      </div>

      {/* Chat area */}
      <div
        className={`${
          mobileView === "sidebar" ? "hidden" : "flex"
        } md:flex flex-1 flex-col min-w-0`}
      >
        {/* Thread header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] bg-white shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile back to sidebar */}
            <button
              onClick={() => setMobileView("sidebar")}
              className="md:hidden w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition mr-1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-[16px] font-medium text-gray-900 font-['Instrument_Serif'] truncate max-w-sm">
              {activeThread?.title ?? "Research"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                activeId && handlePin(activeId, !activeThread?.pinned)
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition ${
                activeThread?.pinned
                  ? "bg-blue-50 text-blue-700 border-blue-100"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Pin size={12} />
              {activeThread?.pinned ? "Pinned" : "Pin Research"}
            </button>
            <button
              onClick={() => activeId && handleDelete(activeId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition"
            >
              <Trash2 size={12} />
              Delete Research
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              <svg
                className="animate-spin mr-2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Loading…
            </div>
          ) : (
            <MessageList
              messages={messages}
              thinking={thinking}
              hasPdf={!!pendingPdf}
              error={error}
            />
          )}
          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <ResearchComposer onSend={handleSend} disabled={thinking} />
      </div>
    </div>
  );
}