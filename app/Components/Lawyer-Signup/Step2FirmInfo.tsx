// components/lawyer-signup/Step2FirmInfo.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

export interface FirmFormData {
  firmName: string;
  email: string;
  phone: string;
  officeAddress: string;
  firmEstablishmentYear: string;
  rcNumber: string;
  verifyingPartnerScn: string;
  locationCity: string;
  practiceAreaIds: string[];
  primaryAreaId: string;
  secondaryAreaId: string;
  areaServices: Record<string, { service: string; pricing: string }[]>;
  feeRangeMin: string;
  feeRangeMax: string;
}

interface Props {
  onNext: (data: FirmFormData) => void;
  subStep: number; // ← from parent
  onSubStepChange: (n: number) => void; // ← from parent
}

const LABELS = [
  "Personal Information",
  "Select Your Practice Areas",
  "Specialization & Pricing",
];

export default function Step2FirmInfo({
  onNext,
  subStep,
  onSubStepChange,
}: Props) {
  const [cityOpen, setCityOpen] = useState(false);
  const [error, setError] = useState("");

  const { data: practiceAreas = [] } = usePracticeAreas();

  const [form, setForm] = useState<FirmFormData>({
    firmName: "",
    email: "",
    phone: "",
    officeAddress: "",
    firmEstablishmentYear: "",
    rcNumber: "",
    verifyingPartnerScn: "",
    locationCity: "",
    practiceAreaIds: [],
    primaryAreaId: "",
    secondaryAreaId: "",
    areaServices: {},
    feeRangeMin: "",
    feeRangeMax: "",
  });

  const set = (key: keyof FirmFormData, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  const toggleArea = (id: string) => {
    const current = form.practiceAreaIds;
    let next: string[];
    if (current.includes(id)) {
      next = current.filter((i) => i !== id);
      if (form.primaryAreaId === id) set("primaryAreaId", "");
      if (form.secondaryAreaId === id) set("secondaryAreaId", "");
    } else {
      if (current.length >= 7) return;
      next = [...current, id];
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
        !form.firmName ||
        !form.email ||
        !form.phone ||
        !form.officeAddress ||
        !form.firmEstablishmentYear
      ) {
        setError("Please fill in all required fields.");
        return;
      }
      onSubStepChange(2);
    } else if (subStep === 2) {
      if (form.practiceAreaIds.length === 0) {
        setError("Please select at least one practice area.");
        return;
      }
      onSubStepChange(3);
    } else {
      onNext(form);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <AccountTypeBadge type="firm" />
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

          {/* Sub-step 1 */}
          {subStep === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  Firm Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.firmName}
                  onChange={(e) => set("firmName", e.target.value)}
                  placeholder="Akintade & Co."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="contact@firm.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                />
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
                  Office Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.officeAddress}
                  onChange={(e) => set("officeAddress", e.target.value)}
                  placeholder="27A Macarthy Street, Lagos Island..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  Year Established <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.firmEstablishmentYear}
                  onChange={(e) => set("firmEstablishmentYear", e.target.value)}
                  placeholder="1990"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1A56DB] transition-colors"
                />
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
