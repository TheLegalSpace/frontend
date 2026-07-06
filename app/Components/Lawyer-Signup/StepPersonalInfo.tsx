// app/Components/Lawyer-Signup/StepPersonalInfo.tsx
"use client";

import { useState } from "react";
import { Lock, Mail, User, Phone, Calendar, MapPin } from "lucide-react";
import { AccountType } from "./LawyerSignup";

interface Props {
  accountType: AccountType;
  email: string;
  onNext: (data: Record<string, string>) => void;
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0">
      {children}
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}

export default function StepPersonalInfo({
  accountType,
  email,
  onNext,
}: Props) {
  const isLawyer = accountType === "lawyer";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [phone, setPhone] = useState("");
  const [callToBarYear, setCallToBarYear] = useState("");
  const [firmEstablishmentYear, setFirmEstablishmentYear] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [error, setError] = useState("");

  const inputCls =
    "w-full px-3 py-3 border-b border-gray-200 text-[14px] outline-none focus:border-[#1A56DB] transition-colors bg-transparent placeholder:text-gray-400 font-dmSans";

  const handleNext = () => {
    setError("");
    if (isLawyer) {
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
      onNext({ firstName, lastName, phone, callToBarYear, locationCity });
    } else {
      if (!firmName || !phone || !firmEstablishmentYear || !locationCity) {
        setError("Please fill in all required fields.");
        return;
      }
      onNext({ firmName, phone, firmEstablishmentYear, locationCity });
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-[28px] sm:text-[32px] font-semibold text-gray-900 mb-2 font-dmSans leading-tight">
        Tell Us About Yourself
      </h2>
      <p className="text-[14px] text-gray-500 mb-7 font-dmSans leading-relaxed">
        Share your details so clients and the legal community can better
        understand your professional background.
      </p>

      {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col gap-0 border border-gray-200 rounded-xl overflow-hidden mb-5">
        {isLawyer ? (
          <>
            <div className="grid grid-cols-2">
              <div className="relative border-r border-gray-200">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter firstname"
                  className={`${inputCls} pl-9`}
                />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter lastname"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="Enter Firm Name"
              className={`${inputCls} pl-9`}
            />
          </div>
        )}

        {/* Email (locked) */}
        <div className="relative border-t border-gray-200">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={email}
            disabled
            className={`${inputCls} pl-9 pr-9 text-gray-400`}
          />
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
        </div>

        {/* WhatsApp */}
        <div className="relative border-t border-gray-200">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="WhatsApp Number"
            className={`${inputCls} pl-9`}
          />
        </div>
        <p className="text-[11px] text-gray-400 px-3 pb-2">
          Your number will remain confidential and will only be shared if you
          choose to do so.
        </p>

        {/* Call to bar / Year established */}
        <div className="relative border-t border-gray-200">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="number"
            value={isLawyer ? callToBarYear : firmEstablishmentYear}
            onChange={(e) =>
              isLawyer
                ? setCallToBarYear(e.target.value)
                : setFirmEstablishmentYear(e.target.value)
            }
            placeholder={isLawyer ? "Call to bar year" : "Year Established"}
            className={`${inputCls} pl-9`}
          />
        </div>

        {/* Location */}
        <div className="relative border-t border-gray-200">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={locationCity}
            onChange={(e) => setLocationCity(e.target.value)}
            className={`${inputCls} pl-9 pr-8 bg-white appearance-none`}
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
        className="w-full py-3.5 bg-[#1A56DB] text-white text-[14px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors font-dmSans"
      >
        Save & Continue
      </button>
    </div>
  );
}
