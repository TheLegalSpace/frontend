// components/settings/AnonymousSection.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { profileService } from "@/services/profile.services";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  isAnonymous: boolean;
}

export default function AnonymousSection({ isAnonymous: initialValue }: Props) {
  const [isAnonymous, setIsAnonymous] = useState(initialValue);
  const [isToggling, setIsToggling] = useState(false);
  const queryClient = useQueryClient();

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await profileService.toggleAnonymous(!isAnonymous);
      setIsAnonymous((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    } catch (err) {
      console.error("Failed to toggle anonymous:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="py-6 border-b border-gray-100">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-semibold text-gray-900 mb-1">
            Anonymous
          </h2>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Stay anonymous while chatting. Your identity will only be shared
            when you choose to reveal it.
          </p>
        </div>

        {/* ✅ Fixed toggle */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          aria-label="Toggle anonymous mode"
          role="switch"
          aria-checked={isAnonymous}
          className="shrink-0 mt-0.5 disabled:opacity-60"
        >
          {isToggling ? (
            <div className="w-11 h-6 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                isAnonymous ? "bg-[#1F2937]" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  isAnonymous ? "translate-x-[22p right-1" : "translate-x-[3px] left-1"
                }`}
              />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}