"use client";

import { TrendingUp } from "lucide-react";

interface LeadStats {
  total: number;
  pending: number;
  accepted: number;
  declined: number;
  expired: number;
}

interface Props {
  // FIX: Stats are now fetched once by LeadsPage and passed here.
  // LeadsStatsRow no longer makes any API calls of its own —
  // that was causing 5 extra requests on every mount.
  stats: LeadStats | null;
  profileViews?: number; // wire up later
}

export default function LeadsStatsRow({ stats, profileViews = 0 }: Props) {
  const responseRate = (() => {
    if (!stats) return null;
    const resolved = stats.accepted + stats.declined + stats.expired;
    return resolved > 0 ? Math.round((stats.accepted / resolved) * 100) : 0;
  })();

  function rateLabel(rate: number) {
    if (rate >= 90) return "Excellent";
    if (rate >= 70) return "Good";
    if (rate >= 50) return "Average";
    return "Needs improvement";
  }

  const items = [
    {
      label: "Total Leads",
      value: stats ? stats.total : "—",
      sub: "All time",
      positive: !!stats && stats.total > 0,
    },
    {
      label: "New Leads",
      value: stats ? stats.pending : "—",
      sub: "Pending",
      positive: !!stats && stats.pending > 0,
    },
    {
      label: "Profile Views",
      value: profileViews > 0 ? profileViews : "—",
      sub: profileViews > 0 ? "This month" : "Coming soon",
      positive: profileViews > 0,
    },
    {
      label: "Response Rate",
      value: responseRate !== null ? `${responseRate}%` : "—",
      sub: responseRate !== null ? rateLabel(responseRate) : "",
      positive: typeof responseRate === "number" && responseRate >= 70,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 px-4">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[#E5E7EB] rounded-xl px-5 py-4"
        >
          <p className="text-[12px] text-gray-400 mb-1">{stat.label}</p>
          <p className="text-[32px]  text-gray-900 leading-none font-[Instrument_Serif]">
            {stat.value}
          </p>
          <p
            className={`text-[12px] mt-2 flex items-center gap-1 ${
              stat.positive ? "text-green-600" : "text-gray-400"
            }`}
          >
            {stat.positive && <TrendingUp size={11} />}
            {stat.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
