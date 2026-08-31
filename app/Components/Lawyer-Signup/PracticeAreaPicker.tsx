// components/lawyer-signup/PracticeAreaPicker.tsx
"use client";

import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { PracticeArea } from "@/services/practice-areas.services";

interface Props {
  practiceAreas: PracticeArea[];
  selectedIds: string[];
  primaryId: string;
  secondaryId: string;
  onToggle: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onSetSecondary: (id: string) => void;
  maxSelect?: number;
}

export default function PracticeAreaPicker({
  practiceAreas,
  selectedIds,
  primaryId,
  secondaryId,
  onToggle,
  maxSelect = 7,
}: Props) {
  const [search, setSearch] = useState("");

  const filtered = practiceAreas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const getAreaName = (id: string) =>
    practiceAreas.find((a) => a.id === id)?.name ?? "";

  return (
    <div>
      {/* Primary / Secondary slots */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1.5">
            Primary Area <span className="text-red-400">*</span>
          </label>
          <div className="min-h-9 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white">
            {primaryId ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#1A56DB] border border-blue-200 rounded-full text-[11px]">
                {getAreaName(primaryId)}
                <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="text-gray-300 text-[11px]">Not selected</span>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1.5">
            Secondary Area <span className="text-red-400">*</span>
          </label>
          <div className="min-h-9 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-white">
            {secondaryId ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-[#1A56DB] border border-blue-200 rounded-full text-[11px]">
                {getAreaName(secondaryId)}
                <Check className="w-3 h-3" />
              </span>
            ) : (
              <span className="text-gray-300 text-[11px]">Not selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search practice areas"
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1A56DB] transition-colors"
        />
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2 mb-2">
        {filtered
          .filter((a) => !selectedIds.includes(a.id))
          .map((area) => (
            <button
              key={area.id}
              onClick={() => {
                if (selectedIds.length < maxSelect) onToggle(area.id);
              }}
              disabled={selectedIds.length >= maxSelect}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-full text-[12px] text-gray-700 hover:border-gray-300 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {area.name}
              <Plus className="w-3 h-3" />
            </button>
          ))}

        {/* Selected pills */}
        {selectedIds.map((id) => {
          const area = practiceAreas.find((a) => a.id === id);
          if (!area) return null;
          if (!area.name.toLowerCase().includes(search.toLowerCase())) return null;
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#1A56DB] rounded-full text-[12px] hover:bg-blue-100 transition-colors"
            >
              {area.name}
              <X className="w-3 h-3" />
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-gray-400 italic">
        You can only select up to {maxSelect} areas where you have strong experience.
      </p>
    </div>
  );
}

// Need Check import
import { Check } from "lucide-react";