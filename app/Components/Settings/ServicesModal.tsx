// components/settings/ServicesModal.tsx
"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { useUpdateServices } from "@/hooks/useSettings";
import { ServiceRow } from "@/services/settings.services";
 
interface Props {
  practiceAreaId: string;
  practiceAreaName: string;
  existingServices: ServiceRow[];
  onClose: () => void;
}

export default function ServicesModal({
  practiceAreaId,
  practiceAreaName,
  existingServices,
  onClose,
}: Props) {
  const [rows, setRows] = useState<ServiceRow[]>(
    existingServices.length > 0
      ? existingServices
      : [{ service: "", pricing: "" }]
  );
  const [error, setError] = useState("");
  const updateServices = useUpdateServices();

  const updateRow = (i: number, field: keyof ServiceRow, val: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: val };
    setRows(next);
  };

  const addRow = () => setRows([...rows, { service: "", pricing: "" }]);

  const handleSave = async () => {
    setError("");
    try {
      await updateServices.mutateAsync({ practiceAreaId, services: rows.filter((r) => r.service.trim()) });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[15px] font-semibold text-gray-900">Specialization & Pricing</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        {/* Area badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full text-[12px] font-medium">
            {practiceAreaName}
          </span>
        </div>

        {/* Service rows */}
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Service</label>
              <input
                type="text"
                value={row.service}
                onChange={(e) => updateRow(i, "service", e.target.value)}
                placeholder="e.g., Contract Drafting..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#2563EB] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Pricing</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">₦</span>
                <input
                  type="text"
                  value={row.pricing}
                  onChange={(e) => updateRow(i, "pricing", e.target.value)}
                  placeholder="e.g., ₦50,000"
                  className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add new */}
        <button
          onClick={addRow}
          className="w-full py-2.5 border border-gray-200 rounded-xl text-[12px] text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-1.5 mb-4 transition-colors"
        >
          Add New <Plus className="w-3.5 h-3.5" />
        </button>

        <p className="text-[11px] text-gray-400 italic mb-4">
          Pricing is used for matching and will not be displayed publicly.
        </p>

        {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={updateServices.isPending}
          className="w-full py-3 bg-[#2563EB] text-white text-[13px] font-medium rounded-xl hover:bg-[#1d4ed8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {updateServices.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {updateServices.isPending ? "Saving..." : "Save and Continue"}
        </button>
      </div>
    </div>
  );
}