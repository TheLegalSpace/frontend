// components/lawyer-signup/Step1AccountType.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccountType = "firm" | "lawyer";

interface Props {
  onNext: (type: AccountType) => void;
}

const OPTIONS: { label: string; value: AccountType }[] = [
  { label: "Law Firm", value: "firm" },
  { label: "Independent Lawyer", value: "lawyer" },
];

export default function Step1AccountType({ onNext }: Props) {
  const [selected, setSelected] = useState<AccountType | "">("");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <p className="text-[12px] text-gray-500 uppercase tracking-wide mb-3">
          Account Type
        </p>

        {/* Select */}
        <div className="relative mb-4">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] bg-white hover:border-gray-300 transition-colors"
          >
            <span className={selected ? "text-gray-900" : "text-gray-400"}>
              {selected ? OPTIONS.find((o) => o.value === selected)?.label : "Select account type"}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSelected(opt.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-[13px] hover:bg-gray-50 transition-colors ${
                    selected === opt.value ? "text-[#1A56DB] bg-blue-50" : "text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => selected && onNext(selected)}
          disabled={!selected}
          className="w-full py-2.5 bg-[#1A56DB] text-white text-[13px] font-medium rounded-lg hover:bg-[#1648b8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}