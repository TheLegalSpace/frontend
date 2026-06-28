// components/settings/ServicesModal.tsx
"use client";

import { useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { useUpdateServices } from "@/hooks/useSettings";
import { ServiceOffering } from "@/services/settings.services";
import { useToast } from "@/app/context/ToastContext";

interface PracticeArea {
  id: string;
  name: string;
}

// ✅ Client-side row — uses index as key, no stable id needed
interface EditRow {
  name: string;
  priceNaira: string; // user types naira, we convert to kobo on save
}

interface Props {
  areaId: string;
  areaName: string;
  allServices: ServiceOffering[]; // ALL current services across all areas
  practiceAreas: PracticeArea[];
  onClose: () => void;
}

function nairaToKobo(naira: string): number {
  return Math.round(parseFloat(naira.replace(/,/g, "") || "0") * 100);
}

function koboToNaira(kobo: number): string {
  return (kobo / 100).toString();
}

export default function ServicesModal({
  areaId,
  areaName,
  allServices,
  practiceAreas,
  onClose,
}: Props) {
  const { showSuccess, showError } = useToast();
  const updateServices = useUpdateServices();

  // ✅ Seed rows from existing services for this area
  const existingForArea = allServices.filter((s) => s.practiceAreaId === areaId);

  const [rows, setRows] = useState<EditRow[]>(
    existingForArea.length > 0
      ? existingForArea.map((s) => ({
          name: s.name,
          priceNaira: koboToNaira(s.price),
        }))
      : [{ name: "", priceNaira: "" }]
  );

  const [error, setError] = useState("");

  const addRow = () => setRows((prev) => [...prev, { name: "", priceNaira: "" }]);

  const removeRow = (i: number) => {
    if (rows.length === 1) return; // keep at least one row
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateRow = (i: number, field: keyof EditRow, val: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
  };

  const handleSave = async () => {
    setError("");

    // ✅ Validate — at least one filled row
    const filledRows = rows.filter((r) => r.name.trim());
    if (filledRows.length === 0) {
      setError("Please add at least one service.");
      return;
    }

    // ✅ Every filled name needs a price
    for (const row of filledRows) {
      if (!row.priceNaira.trim() || parseFloat(row.priceNaira) < 0) {
        setError(`Please add a valid price for "${row.name}".`);
        return;
      }
    }

    // ✅ Build the FULL services list (replace-all)
    // Keep other areas' services untouched, replace only this area's
    const otherAreaServices = allServices
      .filter((s) => s.practiceAreaId !== areaId)
      .map((s) => ({
        practiceAreaId: s.practiceAreaId,
        name: s.name,
        price: s.price,
      }));

    const thisAreaServices = filledRows.map((row) => ({
      practiceAreaId: areaId,
      name: row.name.trim(),
      price: nairaToKobo(row.priceNaira),
    }));

    const allServiceRows = [...otherAreaServices, ...thisAreaServices];

    try {
      await updateServices.mutateAsync(allServiceRows);
      showSuccess(`Services for ${areaName} updated.`);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to save services.";
      showError(msg);
      setError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              Specialization & Pricing
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              All fields required per service
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        {/* Area badge */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-full text-[12px] font-medium">
            {areaName} ✓
          </span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_32px] gap-2 mb-2">
          <span className="text-[12px] text-gray-500">
            Service <span className="text-red-400">*</span>
          </span>
          <span className="text-[12px] text-gray-500">
            Pricing <span className="text-red-400">*</span>
          </span>
          <span />
        </div>

        {/* ✅ Rows — keyed by index since ids aren't stable */}
        <div className="flex flex-col gap-2 mb-3 max-h-64 overflow-y-auto">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
                placeholder="e.g., Contract Drafting"
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#2563EB] transition-colors"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">₦</span>
                <input
                  type="number"
                  min="0"
                  value={row.priceNaira}
                  onChange={(e) => updateRow(i, "priceNaira", e.target.value)}
                  placeholder="50000"
                  className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#2563EB] transition-colors"
                />
              </div>
              <button
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add row */}
        <button
          onClick={addRow}
          className="w-full py-2.5 border border-gray-200 border-dashed rounded-xl text-[12px] text-gray-400 hover:bg-white flex items-center justify-center gap-1.5 transition-colors mb-4"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New
        </button>

        <p className="text-[11px] text-gray-400 italic mb-4">
          Pricing is used for matching and will not be displayed publicly.
        </p>

        {error && (
          <p className="text-[12px] text-red-500 mb-3">{error}</p>
        )}

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