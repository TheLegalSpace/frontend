// components/settings/ServicesPricingSection.tsx
"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import ServicesModal, { type AreaFee } from "./ServicesModal";

interface Props {
  /** The lawyer/firm's selected areas with their current fee ranges (kobo). */
  areas: AreaFee[];
}

// Convert kobo to a short naira display string
function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(0)}k`;
  return `₦${naira.toLocaleString()}`;
}

export default function ServicesPricingSection({ areas }: Props) {
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

  if (areas.length === 0) return null;

  const editingArea = areas.find((a) => a.id === editingAreaId) ?? null;

  return (
    <>
      <div className="py-6 border-b border-[#E5E7EB]">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">
          Services & Pricing
        </h2>
        <p className="text-[12px] text-gray-400 italic mb-5">
          Pricing is used for matching and will not be displayed publicly.
        </p>

        <div className="flex flex-col gap-6">
          {areas.map((area) => {
            const hasFees = area.minFee > 0 || area.maxFee > 0;

            return (
              <div key={area.id}>
                {/* Area header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full text-[12px] font-medium">
                    {area.name}
                  </span>
                  <button
                    onClick={() => setEditingAreaId(area.id)}
                    className="text-[12px] font-medium text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit Service
                  </button>
                </div>

                {/* Fee range */}
                {!hasFees ? (
                  <button
                    onClick={() => setEditingAreaId(area.id)}
                    className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-[12px] text-gray-400 hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Set fee range for {area.name}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">
                        Minimum Fee
                      </p>
                      <div className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg bg-white text-[13px] text-gray-700">
                        {formatNaira(area.minFee)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">
                        Maximum Fee
                      </p>
                      <div className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg bg-white text-[13px] text-gray-700">
                        {formatNaira(area.maxFee)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Professional Fees modal — edit one area's range */}
      {editingArea && (
        <ServicesModal
          area={editingArea}
          allAreas={areas}
          onClose={() => setEditingAreaId(null)}
        />
      )}
    </>
  );
}
