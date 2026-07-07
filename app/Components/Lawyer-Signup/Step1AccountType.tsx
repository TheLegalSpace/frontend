// app/Components/Lawyer-Signup/Step1AccountType.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AccountType } from "./LawyerSignup";

interface Props {
  onNext: (type: AccountType) => void;
  isLoading?: boolean;
}

export default function Step1AccountType({ onNext, isLoading = false }: Props) {
  const [selected, setSelected] = useState<AccountType | "">("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!selected) { setError("Please select an account type."); return; }
    onNext(selected as AccountType);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-[28px] sm:text-[32px] font-semibold text-gray-900 mb-2 font-dmSans leading-tight">
        Choose Your Membership Type
      </h2>
      <p className="text-[14px] text-gray-500 mb-8 font-dmSans">
        How would you like to join The Legal Space?
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {(["lawyer", "firm"] as AccountType[]).map((type) => (
          <button
            key={type}
            disabled={isLoading}
            onClick={() => { setSelected(type); setError(""); }}
            className={`w-full text-left px-4 py-3.5 border rounded-xl text-[14px] font-dmSans transition-colors ${
              selected === type
                ? "border-[#1A56DB] bg-blue-50 text-[#1A56DB]"
                : "border-[#E6EAED] text-gray-700 hover:border-gray-300"
            } disabled:opacity-50`}
          >
            {type === "lawyer" ? "Lawyer" : "Law Firm"}
          </button>
        ))}
      </div>

      {error && <p className="text-[12px] text-red-500 mb-3">{error}</p>}

      <button
        onClick={handleContinue}
        className="w-full py-3.5 bg-[#1A56DB] text-white text-[14px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors font-dmSans disabled:opacity-50 flex items-center justify-center gap-2"
        disabled={!selected || isLoading}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
