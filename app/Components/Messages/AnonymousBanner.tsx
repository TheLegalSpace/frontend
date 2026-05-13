"use client"

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { messagesService } from "@/services/messages.services";

interface Props {
    isAnonymous: boolean;
    onToggle: (val: boolean) => void;
}

export default function AnonymousBanner({ isAnonymous, onToggle }: Props) {
    const [loading, setLoading] = useState(false);

    if(!isAnonymous) return null;

    async function handleReveal() {
        setLoading(true);
        try {
            await messagesService.setAnonymous(!isAnonymous);
            onToggle(!isAnonymous);
        } catch (err) {
        console.error("Failed to reveal identity:", err);
        }  finally {
            setLoading(false);
        }
    }

    return (
    <div className="mx-4 mt-3 mb-1 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-amber-800 text-xs">
        <Lock size={13} className="shrink-0" />
        <span>
          You are chatting anonymously. This lawyer cannot see your name or
          contact details.
        </span>
      </div>
 
      <button
        onClick={handleReveal}
        disabled={loading}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition disabled:opacity-60"
      >
        {loading && <Loader2 size={12} className="animate-spin" />}
        Reveal My Identity
      </button>
    </div>
  );
}