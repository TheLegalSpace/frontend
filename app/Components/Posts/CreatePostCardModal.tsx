"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  Upload,
  XCircle,
  ChevronDown,
  Globe,
  Users,
  CheckCircle2,
  FileText,
  Eye,
} from "lucide-react";
import { postsService } from "@/services/posts.services";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
import { useAuth } from "@/app/context/AuthContext";

type Tab = "caption" | "article";
type Audience = "everyone" | "followers";
type ModalState = "compose" | "preview" | "success";

function getInitials(name: string) {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .filter((part) => /[A-Za-z]/.test(part))
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePostModal({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("caption");
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState<ModalState>("compose");

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfDragOver, setPdfDragOver] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  function wrapSelection(wrapper: string, placeholder?: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const selected = body.slice(start, end);
    let newText: string;
    let selStart = start;
    let selEnd = end;

    if (selected.length > 0) {
      newText = body.slice(0, start) + wrapper + selected + wrapper + body.slice(end);
      selStart = start + wrapper.length;
      selEnd = end + wrapper.length;
    } else {
      const ph = placeholder ?? (wrapper === "**" ? "bold text" : "italic text");
      newText = body.slice(0, start) + wrapper + ph + wrapper + body.slice(end);
      selStart = start + wrapper.length;
      selEnd = selStart + ph.length;
    }

    setBody(newText);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    });
  }

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── PDF ────────────────────────────────────────────────────────────────────

  function handlePdfChange(file: File | null) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("PDF must be under 20 MB.");
      return;
    }
    setError("");
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    setPdfFile(file);
    setPdfBlobUrl(URL.createObjectURL(file));
  }

  function clearPdf() {
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    setPdfFile(null);
    setPdfBlobUrl(null);
  }

  // ── reset ──────────────────────────────────────────────────────────────────

  function resetCompose() {
    setBody("");
    setTitle("");
    clearPdf();
    setError("");
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setError("");

    if (tab === "caption") {
      if (!body.trim()) {
        setError("Please write something before posting.");
        return;
      }
      setSubmitting(true);
      try {
        await postsService.createPost(body.trim());
        onCreated();
        setModalState("success");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create post.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Article post
    if (!body.trim()) {
      setError("Add a caption for your article.");
      return;
    }
    if (!title.trim()) {
      setError("Please add an article name.");
      return;
    }
    if (!pdfFile) {
      setError("Please attach a PDF.");
      return;
    }

    setSubmitting(true);
    try {
      await postsService.createArticlePost(body.trim(), pdfFile, title.trim());
      onCreated();
      setModalState("success");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to publish article post.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── success ────────────────────────────────────────────────────────────────

  if (modalState === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={15} className="text-gray-400" />
          </button>
          <div className="flex flex-col items-center text-center pt-2">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-green-500" />
            </div>
            <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
              {tab === "article" ? "Article post published" : "Post published"}
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
              {tab === "article"
                ? "Your article is live. Others on the platform can read and react to it."
                : "Your post is now live on the feed."}
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setModalState("compose");
                  resetCompose();
                }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-white transition"
              >
                Post again
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push("/dashboard/feeds");
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition"
              >
                Go to feed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PDF fullscreen preview ─────────────────────────────────────────────────

  if (modalState === "preview" && pdfBlobUrl) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-gray-950">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={15} className="text-gray-400 shrink-0" />
            <span className="text-[13px] text-gray-200 truncate">
              {pdfFile?.name}
            </span>
          </div>
          <button
            onClick={() => setModalState("compose")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-[12px] hover:bg-gray-700 transition shrink-0 ml-4"
          >
            <X size={13} />
            Back to compose
          </button>
        </div>
        <iframe
          src={pdfBlobUrl}
          className="flex-1 w-full border-0"
          title="PDF Preview"
        />
      </div>
    );
  }

  // ── compose ────────────────────────────────────────────────────────────────

  const canSubmit =
    tab === "caption"
      ? body.trim().length > 0
      : body.trim().length > 0 && title.trim().length > 0 && pdfFile !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
          <div className="flex gap-1">
            {(["caption", "article"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition ${
                  tab === t
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "caption" ? "Caption Post" : "Article Post"}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-4 pb-4 overflow-y-auto flex-1">
          {/* User row + audience */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-semibold overflow-hidden shrink-0">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl as string}
                    alt={user.fullName as string}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials((user?.fullName as string) ?? "")
                )}
              </div>
              <span className="text-[13px] font-medium text-gray-900">
                {(user?.fullName as string) ?? "You"}
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setAudienceOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[12px] text-gray-600 hover:bg-white transition"
              >
                {audience === "everyone" ? (
                  <Globe size={12} />
                ) : (
                  <Users size={12} />
                )}
                {audience === "everyone" ? "Everyone" : "Followers"}
                <ChevronDown size={12} />
              </button>
              {audienceOpen && (
                <div className="absolute right-0 top-9 w-36 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden z-10">
                  {(["everyone", "followers"] as Audience[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAudience(opt);
                        setAudienceOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-white transition ${
                        audience === opt
                          ? "text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {opt === "everyone" ? (
                        <Globe size={12} />
                      ) : (
                        <Users size={12} />
                      )}
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Caption textarea */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(false)}
                className={clsx(
                  "px-3 py-1 rounded-full text-[12px] transition",
                  !previewMode ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700",
                )}
              >
                Write
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={clsx(
                  "px-3 py-1 rounded-full text-[12px] transition",
                  previewMode ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700",
                )}
              >
                Preview
              </button>
            </div>

            {/* Formatting toolbar */}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => wrapSelection("**", "bold text")}
                title="Bold (Ctrl/Cmd+B)"
                className="px-2 py-1 rounded-md text-[13px] font-semibold border border-gray-200 bg-white hover:bg-gray-50"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => wrapSelection("*", "italic text")}
                title="Italic (Ctrl/Cmd+I)"
                className="px-2 py-1 rounded-md text-[13px] italic border border-gray-200 bg-white hover:bg-gray-50"
              >
                I
              </button>
            </div>
          </div>

          {!previewMode ? (
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
                  e.preventDefault();
                  wrapSelection("**", "bold text");
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
                  e.preventDefault();
                  wrapSelection("*", "italic text");
                }
              }}
              placeholder={
                tab === "article"
                  ? "Write a caption for your article…"
                  : "What do you wanna talk about?"
              }
              rows={3}
              className="w-full resize-none outline-none text-[13px] text-gray-800 leading-relaxed placeholder:text-gray-400 mb-3"
            />
          ) : (
            <div className="w-full mb-3">
              <div className="prose max-w-full">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "*Nothing to preview*"}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Article tab */}
          {tab === "article" && (
            <>
              {/* Article name field */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article name"
                className="w-full px-0 py-1.5 outline-none text-[13px] text-gray-800 placeholder:text-gray-400 border-b border-gray-200 focus:border-gray-400 transition bg-transparent mb-3"
              />

              <div className="border-t border-[#E5E7EB] pt-3 mb-3" />

              {!pdfFile ? (
                // Drop zone
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setPdfDragOver(true);
                  }}
                  onDragLeave={() => setPdfDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPdfDragOver(false);
                    handlePdfChange(e.dataTransfer.files[0] ?? null);
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                    pdfDragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <Upload size={18} className="text-red-400" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-700 mb-1">
                    Upload your article PDF
                  </p>
                  <p className="text-[12px] text-gray-400">
                    <span className="text-blue-600">Click to browse</span> or
                    drag and drop · max 20 MB
                  </p>
                </div>
              ) : (
                // File pill with preview button
                <div className="flex items-center justify-between gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-gray-800 truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB · PDF
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setModalState("preview")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Eye size={13} />
                      Preview
                    </button>
                    <button
                      onClick={clearPdf}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 transition"
                    >
                      <XCircle size={15} />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null)}
              />
            </>
          )}

          {error && (
            <p className="text-[12px] text-red-500 mt-3 mb-1">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full mt-4 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {tab === "article" ? "Publish Article Post" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
