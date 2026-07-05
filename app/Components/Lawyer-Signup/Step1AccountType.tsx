// app/Components/Lawyer-Signup/Step1AccountType.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AccountType } from "./LawyerSignup";

interface Props {
  onNext: (type: AccountType) => void;
  canGoBack: boolean;
}

export default function Step1AccountType({ onNext, canGoBack }: Props) {
  const [selected, setSelected] = useState<AccountType | "">("");
  const [open, setOpen] = useState(true);
  const [lawyerSelected, setLawyerSelected] = useState(false);
  const [firmSelected, setFirmSelected] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!selected) {
      setError("Please select an account type.");
      return;
    }
    onNext(selected);
  };

  return (
    <div className="w-full max-w-lg mx-auto md:mx-0 ">
      <div className="">
        <div className="mb-5">
          {/* <label className="block text-[13px] font-medium text-gray-700 mb-2">
            Account Type
          </label> */}

          {/* Dropdown */}
          <div className="">
            {/* <button
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
            </button> */}
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight mb-3 leading-tight font-dmSans">
              Choose Your Membership Type{" "}
            </h3>
            <p className="text-sm sm:text-sm  text-[#84878F] mb- leading-relaxed font-dmSans">
              How would you like to join The Legal Space?
            </p>
            {open && (
              <div className="flex gap-4 flex-col mt-8 ">
                <button
                  onClick={() => {
                    setSelected("lawyer");
                    // setOpen(false);
                    // setError("");
                    setLawyerSelected(true);
                    setFirmSelected(false);
                    // handleContinue("lawyer");
                  }}
                  className={`w-full text-left px-4 py-3 text-[13px] border border-[#E6EAED] rounded-lg text-gray-700 hover:bg-white transition-colors ${lawyerSelected ? "border-blue-500" : ""}`}
                >
                  Lawyer
                </button>
                <button
                  onClick={() => {
                    setSelected("firm");
                    // setOpen(false);
                    // setError("");
                    setLawyerSelected(false);
                    setFirmSelected(true);
                    // handleContinue("firm");
                  }}
                  className={`w-full text-left px-4 py-3 text-[13px] border border-[#E6EAED] rounded-lg text-gray-700 hover:bg-white transition-colors ${firmSelected ? "border-blue-500" : ""}`}
                >
                  Law Firm
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
