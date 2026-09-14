// app/Components/Admin/shared/StatCard.tsx
"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  strikethrough?: boolean;
}

export default function StatCard({
  label,
  value,
  sub,
  trend = "neutral",
  strikethrough = false,
}: StatCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4 min-w-0">
      <p className="text-[11px] tracking-wide text-gray-400 mb-2 uppercase truncate">
        {label}
      </p>
      <p
        className={`text-[26px] text-gray-900 leading-none font-[Instrument_Serif] mb-2 ${
          strikethrough ? "line-through decoration-gray-400" : ""
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[12px] flex items-center gap-1 ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
                ? "text-red-500"
                : "text-gray-400"
          }`}
        >
          {trend === "up" && <ArrowUp size={11} />}
          {trend === "down" && <ArrowDown size={11} />}
          {sub}
        </p>
      )}
    </div>
  );
}
