// app/Components/Lawyer-Signup/Step1AccountType.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AccountType } from "./LawyerSignup";

interface Props {
  onNext: (type: AccountType) => void;
}

export default function Step1AccountType({ onNext }: Props) {
  const [selected, setSelected] = useState<AccountType | "">("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!selected) {
      setError("Please select an account type.");
      return;
    }
    onNext(selected as AccountType);
  };

  return (
    <div className="w-full max-w-lg mx-auto md:mx-0 ">
      <div className="border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
        <div className="mb-5">
          <label className="block text-[13px] font-medium text-gray-700 mb-2">
            Account Type
          </label>

          {/* Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-[13px] text-left transition-colors hover:border-gray-300 bg-white"
            >
              <span className={selected ? "text-gray-900" : "text-gray-400"}>
                {selected === "lawyer"
                  ? "Independent Lawyer"
                  : selected === "firm"
                    ? "Law Firm"
                    : "Select account type"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setSelected("firm");
                    setOpen(false);
                    setError("");
                  }}
                  className="w-full text-left px-4 py-3 text-[13px] text-gray-700 hover:bg-white transition-colors"
                >
                  Law Firm
                </button>
                <button
                  onClick={() => {
                    setSelected("lawyer");
                    setOpen(false);
                    setError("");
                  }}
                  className="w-full text-left px-4 py-3 text-[13px] text-gray-700 hover:bg-white transition-colors border-t border-gray-50"
                >
                  Independent Lawyer
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 bg-[#1A56DB] text-white text-[13px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
