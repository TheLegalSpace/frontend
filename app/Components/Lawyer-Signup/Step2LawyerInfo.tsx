// app/Components/Lawyer-Signup/Step2LawyerInfo.tsx
"use client";

import { useState } from "react";
import { Lock, Mail, Search, Plus, Check } from "lucide-react";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";

interface Props {
  subStep: number;
  email: string;
  onNext: (data: any) => void;
  canGoBack: boolean;
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

export default function Step2LawyerInfo({
  subStep,
  email,
  onNext,
  canGoBack,
}: Props) {
  // Sub-step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [callToBarYear, setCallToBarYear] = useState("");
  const [locationCity, setLocationCity] = useState("");

  // Sub-step 2
  const { data: allAreas = [] } = usePracticeAreas();
  const [search, setSearch] = useState("");
  const [primaryId, setPrimaryId] = useState("");
  const [secondaryId, setSecondaryId] = useState("");

  // Sub-step 3
  const [areaServices, setAreaServices] = useState<
    Record<string, { service: string; pricing: string }[]>
  >({});

  const [error, setError] = useState("");

  const filteredAreas = allAreas.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getAreaName = (id: string) =>
    allAreas.find((a) => a.id === id)?.name ?? "";

  // ✅ Lawyers: only primary + secondary (max 2)
  // Clicking primary again → deselects
  // Clicking secondary again → deselects
  const handleAreaClick = (id: string) => {
    if (primaryId === id) {
      // Deselect primary — promote secondary to primary if exists
      setPrimaryId(secondaryId);
      setSecondaryId("");
      return;
    }
    if (secondaryId === id) {
      // Deselect secondary
      setSecondaryId("");
      return;
    }
    // Select new area
    if (!primaryId) {
      setPrimaryId(id);
      return;
    }
    if (!secondaryId) {
      setSecondaryId(id);
      return;
    }
    // Both slots taken — replace secondary
    setSecondaryId(id);
  };

  const selectedIds = [primaryId, secondaryId].filter(Boolean);

  const handleNext = () => {
    setError("");

    if (subStep === 1) {
      if (
        !firstName ||
        !lastName ||
        !phone ||
        !callToBarYear ||
        !locationCity
      ) {
        setError("Please fill in all required fields.");
        return;
      }
      onNext({ firstName, lastName, phone, callToBarYear, locationCity, officeAddress: locationCity });
    } else if (subStep === 2) {
      if (!primaryId) {
        setError("Please select a primary practice area.");
        return;
      }
      // ✅ Init services for selected areas
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
        secondaryAreaId: secondaryId || null,
      });
    } else if (subStep === 3) {
      const areaIds = Object.keys(areaServices);

      if (areaIds.length === 0) {
        setError("Please add at least one service.");
        return;
      }

      for (const areaId of areaIds) {
        const rows = areaServices[areaId] ?? [];
        const hasFilledService = rows.some((row) => row.service.trim() !== "");
        const areaName = getAreaName(areaId);

        if (!hasFilledService) {
          setError(`Please add at least one service for ${areaName}.`);
          return;
        }

        // ✅ Also validate pricing is filled for any service that has a name
        for (const row of rows) {
          if (row.service.trim() && !row.pricing.trim()) {
            setError(
              `Please add a price for "${row.service}" under ${areaName}.`,
            );
            return;
          }
        }
      }
      onNext({ areaServices });
    }
  };

  // ─── Sub-step 1: Personal Info ─────────────────────────────────────────────
  if (subStep === 1) {
    return (
      <div className="w-full">
        <div className="">
          <div className="flex items-center justify-between mb">
            <h2 className="text-[30px] font-semibold text-gray-900 font-dmSans">
              Tell Us About Yourself{" "}
            </h2>
            <span className="text-[12px] text-gray-400">1/3</span>
          </div>
          <span className="text-[12px] text-gray-400 block mb-5 w-[75%]">
            Share your details so clients and the legal community can better
            understand your professional background.
          </span>

          {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Oluwaseun"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Adedada"
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
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-500 bg-white outline-none"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
                WhatsApp Number <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1A56DB] transition-colors">
                <span className="px-3 py-2.5 text-[13px] text-gray-500 bg-white border-r border-gray-200 shrink-0">
                  +234
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
                Call to Bar Year <span className="text-red-400">*</span>
              </label>
              <input
                value={callToBarYear}
                onChange={(e) => setCallToBarYear(e.target.value)}
                placeholder="2021"
                type="number"
                min="1900"
                max={new Date().getFullYear()}
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

  // ─── Sub-step 2: Practice Areas (max 2 for lawyers) ───────────────────────
  if (subStep === 2) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Practice Areas
            </h2>
            <span className="text-[12px] text-gray-400">2/3</span>
          </div>

          {/* ✅ Lawyer rule explained */}
          <p className="text-[11px] text-gray-400 mb-4">
            Select your primary area and optionally a secondary area. Lawyers
            are limited to 2 practice areas.
          </p>

          {/* Primary / Secondary slots */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] text-gray-500 mb-1.5">
                Primary Area <span className="text-red-400">*</span>
              </label>
              <div className="min-h-[38px] px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white flex items-center">
                {primaryId ? (
                  <button
                    onClick={() => handleAreaClick(primaryId)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-[#1A56DB] rounded-full text-[11px] font-medium hover:bg-blue-100 transition-colors"
                  >
                    {getAreaName(primaryId)}
                    <span className="text-[10px] ml-0.5">✕</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-300">
                    Not selected
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-gray-500 mb-1.5">
                Secondary Area{" "}
                <span className="text-gray-300 text-[10px]">(optional)</span>
              </label>
              <div className="min-h-[38px] px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white flex items-center">
                {secondaryId ? (
                  <button
                    onClick={() => handleAreaClick(secondaryId)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-[#1A56DB] rounded-full text-[11px] font-medium hover:bg-blue-100 transition-colors"
                  >
                    {getAreaName(secondaryId)}
                    <span className="text-[10px] ml-0.5">✕</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-300">
                    Not selected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search practice areas"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
            />
          </div>

          {/* Area pills */}
          <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto">
            {filteredAreas.map((area) => {
              const isPrimary = primaryId === area.id;
              const isSecondary = secondaryId === area.id;
              const isSelected = isPrimary || isSecondary;
              // ✅ Disable unselected areas when both slots are filled
              const bothFilled = !!primaryId && !!secondaryId;
              const isDisabled = bothFilled && !isSelected;

              return (
                <button
                  key={area.id}
                  onClick={() => handleAreaClick(area.id)}
                  disabled={isDisabled}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition-colors ${
                    isPrimary
                      ? "bg-[#1A56DB] border-[#1A56DB] text-white"
                      : isSecondary
                        ? "bg-blue-50 border-blue-200 text-[#1A56DB]"
                        : isDisabled
                          ? "border-[#E5E7EB] text-gray-300 cursor-not-allowed"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  {area.name}
                  {isPrimary && <Check className="w-3 h-3" />}
                  {isSecondary && <Check className="w-3 h-3" />}
                  {!isSelected && !isDisabled && <Plus className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#1A56DB]" />
              <span className="text-[11px] text-gray-400">Primary</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200" />
              <span className="text-[11px] text-gray-400">Secondary</span>
            </div>
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

  // ─── Sub-step 3: Specialization & Pricing ─────────────────────────────────
  if (subStep === 3) {
    const addRow = (areaId: string) => {
      setAreaServices((prev) => ({
        ...prev,
        [areaId]: [...(prev[areaId] ?? []), { service: "", pricing: "" }],
      }));
    };

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
      <div className="w-full max-w-sm mx-auto">
        <div className="border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Specialization & Pricingv
            </h2>
            <span className="text-[12px] text-gray-400">3/3</span>
          </div>

          <div className="flex flex-col gap-6">
            {selectedIds.map((areaId) => {
              const rows = areaServices[areaId] ?? [
                { service: "", pricing: "" },
              ];
              const areaName = getAreaName(areaId);
              const isPrimary = primaryId === areaId;

              return (
                <div key={areaId}>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium mb-3 ${
                      isPrimary
                        ? "bg-[#1A56DB] text-white"
                        : "bg-blue-50 border border-blue-200 text-[#1A56DB]"
                    }`}
                  >
                    {areaName} <Check className="w-3 h-3" />
                    {isPrimary && (
                      <span className="text-[10px] opacity-70 ml-1">
                        Primary
                      </span>
                    )}
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
                            type="number"
                            placeholder="e.g., 50000"
                            className="w-full pl-6 pr-3 py-2.5 border border-gray-200 rounded-xl text-[12px] outline-none focus:border-[#1A56DB] transition-colors"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => addRow(areaId)}
                      className="w-full py-2 border border-[#E5E7EB] rounded-xl text-[12px] text-gray-400 hover:bg-white flex items-center justify-center gap-1 transition-colors"
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
