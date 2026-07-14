// components/settings/PracticeAreasModal.tsx
"use client";

import { useState } from "react";
import { X, Search, Plus, Check, Loader2 } from "lucide-react";
import { useUpdatePracticeAreas } from "@/hooks/useSettings";
import { PracticeArea } from "@/services/practice-areas.services";
import type { PracticeAreaFee } from "@/services/settings.services";
import { useToast } from "@/app/context/ToastContext";

interface Props {
  practiceAreas: PracticeArea[];
  currentIds: string[];
  primaryId: string;
  secondaryId: string;
  onClose: () => void;
  /** 2 for LAWYER, 7 for FIRM */
  maxSelect: number;
  /** Existing fee ranges (kobo) so they're preserved when areas change. */
  existingFees?: { id: string; minFee: number; maxFee: number }[];
}

export default function PracticeAreasModal({
  practiceAreas,
  currentIds,
  primaryId: initialPrimary,
  secondaryId: initialSecondary,
  onClose,
  maxSelect,
  existingFees = [],
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(currentIds);
  const [primaryId, setPrimaryId] = useState(initialPrimary);
  const [secondaryId, setSecondaryId] = useState(initialSecondary);
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();

  const updateAreas = useUpdatePracticeAreas();

  const filtered = practiceAreas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getAreaName = (id: string) =>
    practiceAreas.find((a) => a.id === id)?.name ?? "";

  const toggleArea = (id: string) => {
    if (selectedIds.includes(id)) {
      // Deselect
      const next = selectedIds.filter((i) => i !== id);
      setSelectedIds(next);
      if (primaryId === id) setPrimaryId("");
      if (secondaryId === id) setSecondaryId("");
    } else {
      // Enforce cap
      if (selectedIds.length >= maxSelect) return;
      const next = [...selectedIds, id];
      setSelectedIds(next);
      if (!primaryId) {
        setPrimaryId(id);
        return;
      }
      if (!secondaryId) {
        setSecondaryId(id);
        return;
      }
    }
  };

  const handleSave = async () => {
    setError("");
    if (!primaryId) {
      setError("Please select a primary area.");
      return;
    }
    try {
      // Order: primary, then secondary, then any remaining selected areas.
      const orderedIds = Array.from(
        new Set([primaryId, secondaryId, ...selectedIds].filter(Boolean)),
      );

      // Preserve existing fee ranges for kept areas; new areas start at 0/0
      // (the lawyer/firm sets them via the Professional Fees modal).
      const practiceAreas: PracticeAreaFee[] = orderedIds.map((id) => {
        const fee = existingFees.find((f) => f.id === id);
        return {
          practiceAreaId: id,
          minFee: fee?.minFee ?? 0,
          maxFee: fee?.maxFee ?? 0,
        };
      });

      await updateAreas.mutateAsync({ practiceAreas });
      onClose();
      showSuccess("Changes saved successfully");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save.";
      setError(msg);
      showError("Error saving changes. Retry!");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Practice Areas
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
        <p className="text-[12px] text-gray-400 mb-5">
          {selectedIds.length}/{maxSelect} selected —{" "}
          {maxSelect === 2
            ? "Lawyers may choose a primary and optional secondary area."
            : "Firms may select up to 7 practice areas."}
        </p>

        {/* Primary / Secondary slots */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">
              Primary Area <span className="text-red-400">*</span>
            </label>
            <div className="min-h-9 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white flex items-center">
              {primaryId ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full text-[11px] font-medium">
                  {getAreaName(primaryId)} <Check className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[11px] text-gray-300">Not selected</span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1.5">
              Secondary Area <span className="text-red-400">*</span>
            </label>
            <div className="min-h-9 px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white flex items-center">
              {secondaryId ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full text-[11px] font-medium">
                  {getAreaName(secondaryId)} <Check className="w-3 h-3" />
                </span>
              ) : (
                <span className="text-[11px] text-gray-300">Not selected</span>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search practice areas"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-5 max-h-52 overflow-y-auto">
          {filtered.map((area) => {
            const isSelected = selectedIds.includes(area.id);
            const atLimit = selectedIds.length >= maxSelect;
            const isDisabled = !isSelected && atLimit;
            return (
              <button
                key={area.id}
                onClick={() => toggleArea(area.id)}
                disabled={isDisabled}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                  isSelected
                    ? "bg-blue-50 border-blue-200 text-[#2563EB]"
                    : isDisabled
                      ? "border-[#E5E7EB] text-gray-300 cursor-not-allowed"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white"
                }`}
              >
                {area.name}
                {isSelected ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
              </button>
            );
          })}
        </div>

        {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={updateAreas.isPending}
          className="w-full py-3 bg-[#2563EB] text-white text-[13px] font-medium rounded-xl hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {updateAreas.isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          )}
          {updateAreas.isPending ? "Saving..." : "Save and Continue"}
        </button>
      </div>
    </div>
  );
}
