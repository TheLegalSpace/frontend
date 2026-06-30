// components/settings/ServicesModal.tsx — "Professional Fees" (per-area min/max)
"use client";

import { useState } from "react";
import { X, Banknote, Loader2 } from "lucide-react";
import { useUpdatePracticeAreas } from "@/hooks/useSettings";
import type { PracticeAreaFee } from "@/services/settings.services";
import { useToast } from "@/app/context/ToastContext";

export interface AreaFee {
  id: string;
  name: string;
  minFee: number; // kobo
  maxFee: number; // kobo
}

interface Props {
  /** The practice area whose fee range is being edited. */
  area: AreaFee;
  /** The full set of selected areas — the backend expects the whole array. */
  allAreas: AreaFee[];
  onClose: () => void;
}

function nairaToKobo(naira: string): number {
  return Math.round(parseFloat(naira.replace(/,/g, "") || "0") * 100);
}

function koboToNaira(kobo: number): string {
  return kobo > 0 ? String(kobo / 100) : "";
}

export default function ServicesModal({ area, allAreas, onClose }: Props) {
  const { showSuccess, showError } = useToast();
  const updateAreas = useUpdatePracticeAreas();

  const [minNaira, setMinNaira] = useState(koboToNaira(area.minFee));
  const [maxNaira, setMaxNaira] = useState(koboToNaira(area.maxFee));
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");

    const minFee = nairaToKobo(minNaira);
    const maxFee = nairaToKobo(maxNaira);

    if (!minNaira.trim() || !maxNaira.trim()) {
      setError("Please enter both a minimum and maximum fee.");
      return;
    }
    if (minFee < 0 || maxFee < 0) {
      setError("Fees can't be negative.");
      return;
    }
    if (minFee > maxFee) {
      setError("Minimum fee can't be greater than the maximum fee.");
      return;
    }

    // Backend expects the FULL array — replace only this area's range.
    const practiceAreas: PracticeAreaFee[] = allAreas.map((a) => ({
      practiceAreaId: a.id,
      minFee: a.id === area.id ? minFee : a.minFee,
      maxFee: a.id === area.id ? maxFee : a.maxFee,
    }));

    try {
      await updateAreas.mutateAsync({ practiceAreas });
      showSuccess(`Fees for ${area.name} updated.`);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save fees.";
      setError(msg);
      showError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Professional fees"
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-[22px] font-semibold text-gray-900">
            Professional Fees
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-5">
          Help clients understand your typical fees for services within your
          practice areas.
        </p>

        {/* Area chip */}
        <div className="rounded-xl px-5 py-3 mb-3 text-center bg-[#E7F0FF] border border-[#1A56DB33]">
          <span className="text-[14px] font-medium text-[#1A56DB]">
            {area.name}
          </span>
        </div>

        {/* Min / Max fee */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={minNaira}
              onChange={(e) => setMinNaira(e.target.value)}
              placeholder="Minimum Fee"
              className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1A56DB] transition-colors"
            />
          </div>
          <div className="relative">
            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={maxNaira}
              onChange={(e) => setMaxNaira(e.target.value)}
              placeholder="Maximum Fee"
              className="w-full pl-9 pr-3 py-3 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#1A56DB] transition-colors"
            />
          </div>
        </div>

        {/* Note */}
        <div className="rounded-xl bg-[#FBFAF5] border border-[#EFEBDD] px-4 py-3.5 mb-5">
          <p className="text-[13px] font-semibold text-gray-900 mb-1">Note</p>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            This range helps clients understand your pricing expectations before
            connecting with you. Final fees may vary depending on the nature and
            complexity of the matter.
          </p>
        </div>

        {error && <p className="text-[12px] text-red-600 mb-3">{error}</p>}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={updateAreas.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56DB] py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#1648b8] disabled:opacity-60"
        >
          {updateAreas.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {updateAreas.isPending ? "Saving..." : "Save and Continue"}
        </button>
      </div>
    </div>
  );
}
