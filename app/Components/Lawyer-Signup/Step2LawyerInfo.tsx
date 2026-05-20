// components/lawyer-signup/Step2LawyerInfo.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import AccountTypeBadge from "./AccountTypeBadge";
import PracticeAreaPicker from "./PracticeAreaPicker";
import SpecializationPricing from "./SpecializationPricing";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";

const CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Kano",
  "Ibadan",
  "Benin City",
  "Enugu",
  "Calabar",
  "Warri",
  "Owerri",
];

export interface LawyerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  callToBarYear: string;
  locationCity: string;
  scn: string;
  nbaBranch: string;
  practiceAreaIds: string[];
  primaryAreaId: string;
  secondaryAreaId: string;
  areaServices: Record<string, { service: string; pricing: string }[]>;
  feeRangeMin: string;
  feeRangeMax: string;
}
const LABELS = [
  "Personal Information",
  "Practice Areas",
  "Specialization & Pricing",
];

interface Props {
  onNext: (data: LawyerFormData) => void;
  subStep: number; // ← from parent
  onSubStepChange: (n: number) => void; // ← from parent
}

export default function Step2LawyerInfo({
  onNext,
  subStep,
  onSubStepChange,
}: Props) {
  //   const [subStep, setSubStep] = useState(1);
  const [showPw, setShowPw] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [error, setError] = useState("");

  const { data: practiceAreas = [] } = usePracticeAreas();

  const [form, setForm] = useState<LawyerFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    callToBarYear: "",
    locationCity: "",
    scn: "",
    nbaBranch: "",
    practiceAreaIds: [],
    primaryAreaId: "",
    secondaryAreaId: "",
    areaServices: {},
    feeRangeMin: "",
    feeRangeMax: "",
  });

  const set = (key: keyof LawyerFormData, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  const toggleArea = (id: string) => {
    const current = form.practiceAreaIds;
    let next: string[];
    if (current.includes(id)) {
      next = current.filter((i) => i !== id);
      // Clear primary/secondary if removed
      if (form.primaryAreaId === id) set("primaryAreaId", "");
      if (form.secondaryAreaId === id) set("secondaryAreaId", "");
    } else {
      if (current.length >= 7) return;
      next = [...current, id];
      // Auto-assign primary/secondary
      if (!form.primaryAreaId) {
        setForm((p) => ({ ...p, practiceAreaIds: next, primaryAreaId: id }));
        return;
      }
      if (!form.secondaryAreaId) {
        setForm((p) => ({ ...p, practiceAreaIds: next, secondaryAreaId: id }));
        return;
      }
    }
    set("practiceAreaIds", next);
  };

  const handleNext = () => {
    setError("");
    if (subStep === 1) {
      if (
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        !form.phone ||
        !form.callToBarYear ||
        !form.locationCity
      ) {
        setError("Please fill in all required fields.");
        return;
      }
      onSubStepChange(2); // ← was setSubStep(2)
    } else if (subStep === 2) {
      if (form.practiceAreaIds.length === 0) {
        setError("Please select at least one practice area.");
        return;
      }
      onSubStepChange(3); // ← was setSubStep(3)
    } else {
      onNext(form);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <AccountTypeBadge type="lawyer" />
      <div className="max-w-sm mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-medium text-gray-900">
              {LABELS[subStep - 1]}
            </p>
            <span className="text-[12px] text-gray-400">{subStep}/3</span>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-[12px] text-red-500">{error}</p>
            </div>
          )}

          {/* Sub-step 1: Personal */}
          {subStep === 1 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] text-gray-500 mb-1.5">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="Tunde"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-gray-500 mb-1.5">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Lawal"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="tunde@example.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  WhatsApp Number <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#1A56DB] transition-colors">
                  <span className="px-3 py-2.5 text-[13px] text-gray-500 border-r border-gray-200 bg-gray-50 shrink-0">
                    +234
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="704 2321 221"
                    className="flex-1 px-3 py-2.5 text-[13px] outline-none bg-transparent"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Your number will remain confidential and will only be shared
                  if you choose to do so.
                </p>
              </div>

              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  Call to Bar Year <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.callToBarYear}
                  onChange={(e) => set("callToBarYear", e.target.value)}
                  placeholder="2021"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  Location <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <button
                    onClick={() => setCityOpen(!cityOpen)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] bg-white hover:border-gray-300 transition-colors"
                  >
                    <span
                      className={
                        form.locationCity ? "text-gray-900" : "text-gray-400"
                      }
                    >
                      {form.locationCity || "Select location"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${cityOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {cityOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                      {CITIES.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            set("locationCity", city);
                            setCityOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 transition-colors ${form.locationCity === city ? "text-[#1A56DB] bg-blue-50" : "text-gray-700"}`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub-step 2: Practice Areas */}
          {subStep === 2 && (
            <PracticeAreaPicker
              practiceAreas={practiceAreas}
              selectedIds={form.practiceAreaIds}
              primaryId={form.primaryAreaId}
              secondaryId={form.secondaryAreaId}
              onToggle={toggleArea}
              onSetPrimary={(id) => set("primaryAreaId", id)}
              onSetSecondary={(id) => set("secondaryAreaId", id)}
            />
          )}

          {/* Sub-step 3: Specialization & Pricing */}
          {subStep === 3 && (
            <SpecializationPricing
              selectedAreaIds={form.practiceAreaIds}
              practiceAreas={practiceAreas}
              value={form.areaServices}
              onChange={(val) => set("areaServices", val)}
            />
          )}

          <div className="mt-6">
            <button
              onClick={handleNext}
              className="w-full py-2.5 bg-[#1A56DB] text-white text-[13px] font-medium rounded-lg hover:bg-[#1648b8] transition-colors"
            >
              Save and Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
