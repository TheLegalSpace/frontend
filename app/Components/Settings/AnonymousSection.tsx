// components/settings/AnonymousSection.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToggleAnonymous } from "@/hooks/useSettings";
import { useToast } from "@/app/context/ToastContext";

interface Props {
  isAnonymous: boolean;
}

export default function AnonymousSection({ isAnonymous: initialValue }: Props) {
  const [isAnonymous, setIsAnonymous] = useState(initialValue);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ✅ Hook called at top level — not inside handleToggle
  const toggleAnonymous = useToggleAnonymous();

  // ✅ Sync when prop changes after refetch
  useEffect(() => {
    setIsAnonymous(initialValue);
  }, [initialValue]);

  const handleToggle = async () => {
    if (toggleAnonymous.isPending) return;

    const originalValue = isAnonymous;
    const newValue = !originalValue;
    setIsAnonymous(newValue); // optimistic update

    try {
      // ✅ Call mutateAsync on the mutation object — not the hook itself
      await toggleAnonymous.mutateAsync(newValue);
      await queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      if (isMountedRef.current) {
        showSuccess(newValue ? "You are now anonymous." : "You are now visible."); // ✅
      }
    } catch (err) {
      console.error("Failed to toggle anonymous:", err);
      if (isMountedRef.current) {
        setIsAnonymous(originalValue); // revert on failure
        showError("Failed to update anonymous status."); // ✅
      }
    }
  };

  return (
    <div className="py-6 border-b border-[#E5E7EB]">
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

        {/* Toggle */}
        <button
          onClick={handleToggle}
          disabled={toggleAnonymous.isPending}
          aria-label="Toggle anonymous mode"
          role="switch"
          aria-checked={isAnonymous}
          className="shrink-0 mt-0.5 disabled:opacity-60 cursor-pointer"
        >
          {toggleAnonymous.isPending ? (
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
                  isAnonymous ? "right-1" : "left-1"
                }`}
              />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
