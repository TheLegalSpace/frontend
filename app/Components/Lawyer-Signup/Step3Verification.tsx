// components/lawyer-signup/Step3Verification.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import AccountTypeBadge from "./AccountTypeBadge";

interface Props {
  accountType: "firm" | "lawyer";
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export default function Step3Verification({ accountType, onNext, onBack, isLoading }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const label = accountType === "firm"
    ? "Upload CAC Registration Document"
    : "Upload NBA Certificate";

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { setError("Only PDF files are accepted."); return; }
    if (f.size > 20 * 1024 * 1024) { setError("File must be under 20MB."); return; }
    setError("");
    setFile(f);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <AccountTypeBadge type={accountType} />
      <div className="max-w-sm mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[14px] font-medium text-gray-900 mb-5">Verification</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-[12px] text-red-500">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-[12px] text-gray-500 mb-1.5">
              {label} <span className="text-red-400">*</span>
            </label>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors relative ${
                dragOver ? "border-[#1A56DB] bg-blue-50" : file ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-[#1A56DB]/50 bg-white"
              }`}
            >
              <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              {file ? (
                <>
                  <FileText className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-[13px] text-green-700 font-medium text-center">{file.name}</p>
                  <p className="text-[11px] text-green-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-[13px] text-center text-gray-500">
                    <span className="text-[#1A56DB] font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">PDF (max. 20mb)</p>
                  {/* PDF icon overlay */}
                  <div className="absolute bottom-3 right-3 w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">PDF</span>
                  </div>
                </>
              )}
            </div>

            <p className="text-[11px] text-gray-400 italic mt-2">
              This helps us confirm your professional status.
            </p>
          </div>

          <button
            onClick={() => { if (!file) { setError("Please upload the required document."); return; } onNext(); }}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#1A56DB] text-white text-[13px] font-medium rounded-lg hover:bg-[#1648b8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isLoading ? "Setting up..." : "Finish Setup"}
          </button>
        </div>
      </div>
    </div>
  );
}