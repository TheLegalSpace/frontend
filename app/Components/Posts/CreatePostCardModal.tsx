"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Loader2,
  Upload,
  ImageIcon,
  XCircle,
  ChevronDown,
  Globe,
  Users,
  CheckCircle2,
  AlignLeft,
} from "lucide-react";
import { postsService } from "@/services/posts.services";
import { articlesService } from "@/services/articles.services";
import { useAuth } from "@/app/context/AuthContext";

type Tab = "caption" | "article";
type Audience = "everyone" | "followers";
type ModalState = "compose" | "success";

function getInitials(name: string) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreatePostModal({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const router = useRouter();

  // Shared
  const [tab, setTab] = useState<Tab>("caption");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalState, setModalState] = useState<ModalState>("compose");

  // Article-specific
  const [articleTitle, setArticleTitle] = useState("");
  const [articleBody, setArticleBody] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const articleBodyRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // ── helpers ────────────────────────────────────────────────────────────────

  function handleCoverChange(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Cover must be an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Cover image must be under 5 MB.");
      return;
    }
    setError("");
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function resetCompose() {
    setBody("");
    setArticleTitle("");
    setArticleBody("");
    setCoverFile(null);
    setCoverPreview(null);
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
      setError("Add a caption for your article post.");
      return;
    }
    if (!articleTitle.trim()) {
      setError("Article title is required.");
      return;
    }
    if (!articleBody.trim()) {
      setError("Article body is required.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create the article as published
      const articleRes = await articlesService.createArticle({
        title: articleTitle.trim(),
        body: articleBody.trim(),
        status: "published",
      });
      const articleId = articleRes.data.id;

      // 2. Upload cover if provided
      if (coverFile) {
        try {
          await articlesService.uploadCover(articleId, coverFile);
        } catch {
          // Non-fatal — post still goes out without cover
        }
      }

      // 3. Create the post linked to the article
      await postsService.createPost(body.trim(), articleId);

      onCreated();
      setModalState("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish article post.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── success screen ─────────────────────────────────────────────────────────

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
                onClick={() => { setModalState("compose"); resetCompose(); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Post again
              </button>
              <button
                onClick={() => { onClose(); router.push("/dashboard/feeds"); }}
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

  // ── compose screen ─────────────────────────────────────────────────────────

  const canSubmit =
    tab === "caption"
      ? body.trim().length > 0
      : body.trim().length > 0 && articleTitle.trim().length > 0 && articleBody.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      {/*
        Max-height + overflow-y-auto so the modal scrolls on small screens
        when the article form is tall.
      */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 shrink-0">
          <div className="flex gap-1">
            {(["caption", "article"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
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

        {/* ── Scrollable body ── */}
        <div className="px-4 pb-4 overflow-y-auto flex-1">
          {/* User row + audience */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-semibold overflow-hidden shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl as string} alt={user.fullName as string} className="w-full h-full object-cover" />
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition"
              >
                {audience === "everyone" ? <Globe size={12} /> : <Users size={12} />}
                {audience === "everyone" ? "Everyone" : "Followers"}
                <ChevronDown size={12} />
              </button>

              {audienceOpen && (
                <div className="absolute right-0 top-9 w-36 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-10">
                  {(["everyone", "followers"] as Audience[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setAudience(opt); setAudienceOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] hover:bg-gray-50 transition ${
                        audience === opt ? "text-blue-600 font-medium" : "text-gray-700"
                      }`}
                    >
                      {opt === "everyone" ? <Globe size={12} /> : <Users size={12} />}
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Caption textarea — always shown as the "post caption" */}
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            placeholder={
              tab === "article"
                ? "Write a caption for your article…"
                : "What do you wanna talk about?"
            }
            rows={3}
            className="w-full resize-none outline-none text-[13px] text-gray-800 leading-relaxed placeholder:text-gray-400 mb-3"
          />

          {/* ── Article-specific fields ── */}
          {tab === "article" && (
            <>
              <div className="border-t border-gray-100 pt-3 mb-3" />

              {/* Cover image upload */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleCoverChange(e.dataTransfer.files[0] ?? null);
                }}
                onClick={() => !coverFile && coverInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl mb-3 transition cursor-pointer overflow-hidden ${
                  dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                } ${coverFile ? "h-36" : "p-5 text-center"}`}
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
                />

                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition"
                    >
                      <XCircle size={14} className="text-white" />
                    </button>
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full">
                      Cover image
                    </span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-[12px] text-gray-500">
                      <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Cover image — optional (max 5 MB)
                    </p>
                  </>
                )}
              </div>

              {/* Article title */}
              <input
                type="text"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                placeholder="Article title *"
                maxLength={160}
                className="w-full outline-none text-[14px] font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal mb-1 border-b border-gray-100 pb-2"
              />
              <p className="text-[10px] text-gray-400 text-right mb-3">
                {articleTitle.length}/160
              </p>

              {/* Article body */}
              <div className="relative">
                <AlignLeft size={13} className="absolute top-1 left-0 text-gray-300 pointer-events-none" />
                <textarea
                  ref={articleBodyRef}
                  value={articleBody}
                  onChange={(e) => {
                    setArticleBody(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 240)}px`;
                  }}
                  placeholder="Write your article here… *"
                  rows={5}
                  className="w-full resize-none outline-none text-[13px] text-gray-700 leading-relaxed placeholder:text-gray-400 pl-5"
                />
              </div>
            </>
          )}

          {error && <p className="text-[12px] text-red-500 mt-2 mb-1">{error}</p>}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="w-full mt-3 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {tab === "article" ? "Publish Article Post" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}