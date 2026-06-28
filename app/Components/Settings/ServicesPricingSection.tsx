// components/settings/ServicesPricingSection.tsx
"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import ServicesModal from "./ServicesModal";
import { useServices } from "@/hooks/useSettings";
import { ServiceOffering } from "@/services/settings.services";

interface PracticeArea {
  id: string;
  name: string;
}

interface Props {
  practiceAreas: PracticeArea[]; // the lawyer/firm's selected areas
}

// ✅ Convert kobo to naira display string
function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`;
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(0)}k`;
  return `₦${naira.toLocaleString()}`;
}

export default function ServicesPricingSection({ practiceAreas }: Props) {
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);

  const { data: services = [], isLoading } = useServices(
    practiceAreas.length > 0,
  );

  // ✅ Group fetched services by practiceAreaId
  const servicesByArea = services.reduce<Record<string, ServiceOffering[]>>(
    (acc, s) => {
      if (!acc[s.practiceAreaId]) acc[s.practiceAreaId] = [];
      acc[s.practiceAreaId].push(s);
      return acc;
    },
    {},
  );

  if (practiceAreas.length === 0) return null;

  return (
    <>
      <div className="py-6 border-b border-[#E5E7EB]">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-1">
          Services & Pricing
        </h2>
        <p className="text-[12px] text-gray-400 italic mb-5">
          Pricing is used for matching and will not be displayed publicly.
        </p>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {practiceAreas.map((_, i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {practiceAreas.map((area) => {
              const areaServices = servicesByArea[area.id] ?? [];

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

                  {/* Service rows */}
                  {areaServices.length === 0 ? (
                    <button
                      onClick={() => setEditingAreaId(area.id)}
                      className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-[12px] text-gray-400 hover:bg-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add services for {area.name}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-3">
                        <span className="text-[12px] text-gray-500">
                          Service
                        </span>
                        <span className="text-[12px] text-gray-500">
                          Pricing
                        </span>
                      </div>
                      {areaServices.map((s, i) => (
                        <div key={i} className="grid grid-cols-2 gap-3">
                          <div className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg bg-white text-[13px] text-gray-700 truncate">
                            {s.name}
                          </div>
                          <div className="px-3 py-2.5 border border-[#E5E7EB] rounded-lg bg-white text-[13px] text-gray-700">
                            {formatNaira(s.price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal — edit services for one area */}
      {editingAreaId && (
        <ServicesModal
          areaId={editingAreaId}
          areaName={
            practiceAreas.find((a) => a.id === editingAreaId)?.name ?? ""
          }
          allServices={services}
          practiceAreas={practiceAreas}
          onClose={() => setEditingAreaId(null)}
        />
      )}
    </>
  );
}
