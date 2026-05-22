// components/settings/ServicesPricingSection.tsx
"use client";

import { useState } from "react";
import ServicesModal from "./ServicesModal";
import { ServiceRow } from "@/services/settings.services";
 
interface PracticeAreaService {
  id: string;
  name: string;
  services: ServiceRow[];
}

interface Props {
  areas: PracticeAreaService[];
}

export default function ServicesPricingSection({ areas }: Props) {
  const [editingArea, setEditingArea] = useState<PracticeAreaService | null>(null);

  return (
    <>
      <div className="py-6 border-b border-gray-100">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">
          Services & Pricing
        </h2>
        <p className="text-[12px] text-gray-400 italic mb-5">
          Pricing is used for matching and will not be displayed publicly.
        </p>

        {areas.length === 0 ? (
          <p className="text-[13px] text-gray-400">
            Add practice areas first to set up services.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {areas.map((area) => (
              <div key={area.id}>
                {/* Area header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full text-[12px] font-medium">
                    {area.name}
                  </span>
                  <button
                    onClick={() => setEditingArea(area)}
                    className="text-[12px] font-medium text-[#2563EB] hover:underline"
                  >
                    Edit Service
                  </button>
                </div>

                {/* Service rows */}
                {area.services.length === 0 ? (
                  <p className="text-[12px] text-gray-400 pl-1">No services added</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-3">
                      <span className="text-[12px] text-gray-500">Service</span>
                      <span className="text-[12px] text-gray-500">Pricing</span>
                    </div>
                    {area.services.map((row, i) => (
                      <div key={i} className="grid grid-cols-2 gap-3">
                        <div className="px-3 py-2.5 border border-gray-100 rounded-lg bg-gray-50 text-[13px] text-gray-700">
                          {row.service || "—"}
                        </div>
                        <div className="px-3 py-2.5 border border-gray-100 rounded-lg bg-gray-50 text-[13px] text-gray-700">
                          {row.pricing ? `₦ ${parseInt(row.pricing).toLocaleString()}` : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {editingArea && (
        <ServicesModal
          practiceAreaId={editingArea.id}
          practiceAreaName={editingArea.name}
          existingServices={editingArea.services}
          onClose={() => setEditingArea(null)}
        />
      )}
    </>
  );
}