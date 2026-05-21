"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { messagesService } from "@/services/messages.services";

interface Props {
  isAnonymous: boolean;
  onToggle: (val: boolean) => void;
}

export default function AnonymousBanner({ isAnonymous, onToggle }: Props) {
  const [loading, setLoading] = useState(false);

  // Only shown when still anonymous
  if (!isAnonymous) return null;

  async function handleReveal() {
    setLoading(true);
    try {
      await messagesService.setAnonymous(false);
      onToggle(false);
    } catch (err) {
      console.error("Failed to reveal identity:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-amber-800 text-[12px]">
        <Lock size={14} className="shrink-0 text-amber-600" />
        <span>
          You are chatting anonymously. This lawyer cannot see your name or contact details.
        </span>
      </div>
      <button
        onClick={handleReveal}
        disabled={loading}
        className="shrink-0 flex items-center gap-1.5 px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-[12px] font-medium rounded-lg transition disabled:opacity-60"
      >
        {loading && <Loader2 size={12} className="animate-spin" />}
        Reveal My Identity
      </button>
    </div>
  );
}