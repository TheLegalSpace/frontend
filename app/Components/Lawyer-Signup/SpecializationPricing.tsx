// components/lawyer-signup/SpecializationPricing.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PracticeArea } from "@/services/practice-areas.services";

interface ServiceRow {
  service: string;
  pricing: string;
}

interface AreaServices {
  [areaId: string]: ServiceRow[];
}

interface Props {
  selectedAreaIds: string[];
  practiceAreas: PracticeArea[];
  value: AreaServices;
  onChange: (val: AreaServices) => void;
}

export default function SpecializationPricing({
  selectedAreaIds,
  practiceAreas,
  value,
  onChange,
}: Props) {
  const getAreaName = (id: string) =>
    practiceAreas.find((a) => a.id === id)?.name ?? "";

  const getRows = (id: string): ServiceRow[] =>
    value[id] ?? [{ service: "", pricing: "" }];

  const updateRow = (
    areaId: string,
    rowIndex: number,
    field: keyof ServiceRow,
    val: string,
  ) => {
    const rows = [...getRows(areaId)];
    rows[rowIndex] = { ...rows[rowIndex], [field]: val };
    onChange({ ...value, [areaId]: rows });
  };

  const addRow = (areaId: string) => {
    const rows = [...getRows(areaId), { service: "", pricing: "" }];
    onChange({ ...value, [areaId]: rows });
  };

  return (
    <div className="flex flex-col gap-5">
      {selectedAreaIds.map((areaId) => (
        <div key={areaId}>
          {/* Area badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-[#1A56DB] rounded-full text-[12px] font-medium mb-3">
            {getAreaName(areaId)}
            <span className="text-blue-400">✓</span>
          </div>

          {/* Service rows */}
          {getRows(areaId).map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">
                  Service
                </label>
                <input
                  type="text"
                  value={row.service}
                  onChange={(e) =>
                    updateRow(areaId, i, "service", e.target.value)
                  }
                  placeholder="e.g., Contract Drafting..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1A56DB] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">
                  Pricing
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">
                    ₦
                  </span>
                  <input
                    type="text"
                    value={row.pricing}
                    onChange={(e) =>
                      updateRow(areaId, i, "pricing", e.target.value)
                    }
                    placeholder="e.g., ₦50,000"
                    className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1A56DB] transition-colors"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add new */}
          <button
            onClick={() => addRow(areaId)}
            className="w-full py-2 border border-[#E5E7EB] rounded-lg text-[12px] text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors"
          >
            Add New <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      <p className="text-[11px] text-gray-400 italic">
        Pricing is used for matching and will not be displayed publicly.
      </p>
    </div>
  );
}
