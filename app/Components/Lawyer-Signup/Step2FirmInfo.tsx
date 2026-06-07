// app/Components/Lawyer-Signup/Step2FirmInfo.tsx
"use client";

import { useState } from "react";
import { Lock, Mail, Search, Plus, Check } from "lucide-react";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";

interface Props {
  subStep: number;
  email: string;
  onNext: (data: any) => void;
}

const NIGERIAN_CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Enugu",
  "Benin City",
  "Kaduna",
  "Uyo",
  "Warri",
];

export default function Step2FirmInfo({ subStep, email, onNext }: Props) {
  const [firmName, setFirmName] = useState("");
  const [phone, setPhone] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [firmEstablishmentYear, setFirmEstablishmentYear] = useState("");
  const [locationCity, setLocationCity] = useState("");

  const { data: allAreas = [] } = usePracticeAreas();
  const [search, setSearch] = useState("");
  const [primaryId, setPrimaryId] = useState("");
  const [secondaryId, setSecondaryId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [areaServices, setAreaServices] = useState<
    Record<string, { service: string; pricing: string }[]>
  >({});
  const [error, setError] = useState("");

  const filteredAreas = allAreas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getAreaName = (id: string) =>
    allAreas.find((a) => a.id === id)?.name ?? "";

  const FIRM_MAX = 7;

  const toggleArea = (id: string) => {
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter((i) => i !== id);
      setSelectedIds(next);
      if (primaryId === id) setPrimaryId("");
      if (secondaryId === id) setSecondaryId("");
    } else {
      // Enforce 7-area cap for firms
      if (selectedIds.length >= FIRM_MAX) return;
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

  const handleNext = () => {
    setError("");
    if (subStep === 1) {
      if (
        !firmName ||
        !phone ||
        !officeAddress ||
        !firmEstablishmentYear ||
        !locationCity
      ) {
        setError("Please fill in all required fields.");
        return;
      }
      onNext({
        firmName,
        phone,
        officeAddress,
        firmEstablishmentYear,
        locationCity,
      });
    } else if (subStep === 2) {
      if (!primaryId) {
        setError("Please select at least a primary practice area.");
        return;
      }
      const initServices: Record<
        string,
        { service: string; pricing: string }[]
      > = {};
      selectedIds.forEach((id) => {
        initServices[id] = [{ service: "", pricing: "" }];
      });
      setAreaServices(initServices);
      onNext({
        practiceAreaIds: selectedIds,
        primaryAreaId: primaryId,
        secondaryAreaId: secondaryId,
      });
    } else if (subStep === 3) {
      onNext({ areaServices });
    }
  };

  if (subStep === 1) {
    return (
      <div className="max-w-sm mx-auto md:mx-0">
        <div className="border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Personal Information
            </h2>
            <span className="text-[12px] text-gray-400">1/3</span>
          </div>
          {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Firm Name <span className="text-red-400">*</span>
              </label>
              <input
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Akintade & Co."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={email}
                  disabled
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-500 bg-gray-50 outline-none"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                WhatsApp Number <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A56DB] transition-colors">
                <span className="px-3 py-2.5 text-[13px] text-gray-500 bg-gray-50 border-r border-gray-200 shrink-0">
                  +234 ∨
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="704 2321 221"
                  className="flex-1 px-3 py-2.5 text-[13px] outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Your number will remain confidential and will only be shared if
                you choose to do so.
              </p>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Office Address <span className="text-red-400">*</span>
              </label>
              <input
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="27A Macarthy Street, Lagos Island..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Year Established <span className="text-red-400">*</span>
              </label>
              <input
                value={firmEstablishmentYear}
                onChange={(e) => setFirmEstablishmentYear(e.target.value)}
                placeholder="1990"
                type="number"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Location <span className="text-red-400">*</span>
              </label>
              <select
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1A56DB] transition-colors bg-white"
              >
                <option value="">Select location</option>
                {NIGERIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleNext}
            className="w-full py-3 bg-[#1A56DB] text-white text-[13px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors mt-6"
          >
            Save and Continue
          </button>
        </div>
      </div>
    );
  }

  // Practice areas and specialization are identical to lawyer — reuse same JSX
  if (subStep === 2) {
    const atLimit = selectedIds.length >= FIRM_MAX;
    return (
      <div className="max-w-sm mx-auto md:mx-0">
        <div className="border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Select Your Practice Areas
            </h2>
            <span className="text-[12px] text-gray-400">2/3</span>
          </div>
          <p className="text-[11px] text-gray-400 mb-4">
            {selectedIds.length}/{FIRM_MAX} selected — Firms may select up to{" "}
            {FIRM_MAX} practice areas.
          </p>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search practice areas"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2 mb-3 max-h-52 overflow-y-auto">
            {filteredAreas.map((area) => {
              const isSelected = selectedIds.includes(area.id);
              const isDisabled = !isSelected && atLimit;
              return (
                <button
                  key={area.id}
                  onClick={() => toggleArea(area.id)}
                  disabled={isDisabled}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                    isSelected
                      ? "bg-blue-50 border-blue-200 text-[#1A56DB]"
                      : isDisabled
                        ? "border-[#E5E7EB] text-gray-300 cursor-not-allowed"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {area.name}{" "}
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
            onClick={handleNext}
            className="w-full py-3 bg-[#1A56DB] text-white text-[13px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors"
          >
            Save and Continue
          </button>
        </div>
      </div>
    );
  }

  if (subStep === 3) {
    const addRow = (areaId: string) =>
      setAreaServices((prev) => ({
        ...prev,
        [areaId]: [...(prev[areaId] ?? []), { service: "", pricing: "" }],
      }));
    const updateRow = (
      areaId: string,
      i: number,
      field: "service" | "pricing",
      val: string,
    ) => {
      setAreaServices((prev) => {
        const rows = [...(prev[areaId] ?? [])];
        rows[i] = { ...rows[i], [field]: val };
        return { ...prev, [areaId]: rows };
      });
    };
    return (
      <div className="max-w-sm mx-auto md:mx-0">
        <div className="border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Specialization & Pricing
            </h2>
            <span className="text-[12px] text-gray-400">3/3</span>
          </div>
          <div className="flex flex-col gap-6">
            {selectedIds.map((areaId) => {
              const rows = areaServices[areaId] ?? [
                { service: "", pricing: "" },
              ];
              return (
                <div key={areaId}>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#1A56DB] rounded-full text-[12px] font-medium mb-3">
                    {getAreaName(areaId)} <Check className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-[12px] text-gray-500">Service</span>
                      <span className="text-[12px] text-gray-500">Pricing</span>
                    </div>
                    {rows.map((row, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <input
                          value={row.service}
                          onChange={(e) =>
                            updateRow(areaId, i, "service", e.target.value)
                          }
                          placeholder="e.g., Contract Drafting..."
                          className="px-3 py-2.5 border border-gray-200 rounded-xl text-[12px] outline-none focus:border-[#1A56DB] transition-colors"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">
                            ₦
                          </span>
                          <input
                            value={row.pricing}
                            onChange={(e) =>
                              updateRow(areaId, i, "pricing", e.target.value)
                            }
                            placeholder="e.g., ₦50,000"
                            className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-xl text-[12px] outline-none focus:border-[#1A56DB] transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addRow(areaId)}
                      className="w-full py-2 border border-[#E5E7EB] rounded-xl text-[12px] text-gray-400 hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors"
                    >
                      Add New <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 italic mt-4 mb-4">
            Pricing is used for matching and will not be displayed publicly.
          </p>
          <button
            onClick={handleNext}
            className="w-full py-3 bg-[#1A56DB] text-white text-[13px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors"
          >
            Save and Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}
