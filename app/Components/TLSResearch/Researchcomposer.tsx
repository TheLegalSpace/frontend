"use client";

import { useRef, useState } from "react";
import { Send, Paperclip, X, Loader2, Square } from "lucide-react";

interface Props {
  onSend: (text: string, pdf?: File) => void;
  onCancel?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

export default function ResearchComposer({
  onSend,
  onCancel,
  disabled,
  placeholder,
}: Props) {
  const [text, setText] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    setPdfError("");
    if (file.type !== "application/pdf") {
      setPdfError("Only PDF files are allowed.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setPdfError("PDF must be under 25 MB.");
      return;
    }
    setPdf(file);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed, pdf ?? undefined);
    setText("");
    setPdf(null);
    setPdfError("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const charCount = text.length;
  const overLimit = charCount > 5000;

  return (
    <div className="px-4 py-3 bg-white border-t border-[#E5E7EB]">
      {/* PDF chip */}
      {pdf && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl w-fit text-[12px] text-blue-700">
          <span>📄</span>
          <span className="max-w-55 truncate">{pdf.name}</span>
          <span className="text-blue-400">
            {(pdf.size / 1024).toFixed(0)} KB
          </span>
          <button
            onClick={() => {
              setPdf(null);
              setPdfError("");
            }}
            className="text-blue-400 hover:text-blue-600 transition"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {pdfError && (
        <p className="text-[12px] text-red-500 mb-1.5">{pdfError}</p>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* PDF upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled || !!pdf}
          className="w-16 h-12 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-white hover:text-gray-600 transition disabled:opacity-40 shrink-0 mb-0.5"
          title="Attach PDF"
        >
          <Paperclip size={15} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder ?? "Describe your legal issue or case…"}
            rows={1}
            className="w-full px-4 py-2.5 text-[14px] bg-white border border-gray-200 rounded-2xl outline-none focus:border-gray-300 placeholder:text-gray-400 resize-none leading-relaxed disabled:opacity-50 max-h-40 overflow-y-auto"
            style={{ minHeight: "44px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 160) + "px";
            }}
          />
          {charCount > 4500 && (
            <span
              className={`absolute bottom-2 right-3 text-[10px] ${
                overLimit ? "text-red-500" : "text-gray-400"
              }`}
            >
              {charCount}/5000
            </span>
          )}
        </div>

        {/* Send / Stop button */}
        {disabled && onCancel ? (
          <button
            onClick={onCancel}
            className="w-16 h-12 rounded-full bg-gray-900 hover:bg-gray-800 flex items-center justify-center transition shrink-0 mb-0.5"
            aria-label="Stop generating"
            title="Cancel this request"
          >
            <Square size={13} className="text-white fill-white" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled || overLimit}
            className="w-16 h-12 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center transition disabled:opacity-40 shrink-0 mb-0.5"
            aria-label="Send"
          >
            {disabled ? (
              <Loader2 size={15} className="text-white animate-spin" />
            ) : (
              <Send size={15} className="text-white" />
            )}
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-gray-400 mt-2 leading-relaxed">
        All responses are cross-checked with available legal sources and public
        records to minimise inaccuracies.{" "}
        <span className="font-medium">However</span>, users should independently
        verify critical legal information.
      </p>
    </div>
  );
}