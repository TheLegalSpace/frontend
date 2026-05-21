"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { leadsService } from "@/services/leads.services";

interface Props {
  profileViews?: number; // wire up later
}

export default function LeadsStatsRow({ profileViews = 0 }: Props) {
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [newLeads, setNewLeads] = useState<number | null>(null);
  const [responseRate, setResponseRate] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [totalRes, pendingRes, acceptedRes, declinedRes, expiredRes] =
          await Promise.all([
            leadsService.getLeads(undefined,  1, 1),
            leadsService.getLeads("pending",  1, 1),
            leadsService.getLeads("accepted", 1, 1),
            leadsService.getLeads("declined", 1, 1),
            leadsService.getLeads("expired",  1, 1),
          ]);

        const total    = totalRes?.data?.pagination?.total    ?? 0;
        const pending  = pendingRes?.data?.pagination?.total  ?? 0;
        const accepted = acceptedRes?.data?.pagination?.total ?? 0;
        const declined = declinedRes?.data?.pagination?.total ?? 0;
        const expired  = expiredRes?.data?.pagination?.total  ?? 0;

        setTotalLeads(total);
        setNewLeads(pending);

        // Response rate = accepted out of all leads that have been resolved
        const resolved = accepted + declined + expired;
        setResponseRate(resolved > 0 ? Math.round((accepted / resolved) * 100) : 0);
      } catch (err) {
        console.error("Failed to fetch lead stats:", err);
      }
    }

    fetchCounts();
  }, []);

  function rateLabel(rate: number) {
    if (rate >= 90) return "Excellent";
    if (rate >= 70) return "Good";
    if (rate >= 50) return "Average";
    return "Needs improvement";
  }

  const stats = [
    {
      label: "Total Leads",
      value: totalLeads ?? "—",
      sub: "All time",
      positive: typeof totalLeads === "number" && totalLeads > 0,
    },
    {
      label: "New Leads",
      value: newLeads ?? "—",
      sub: "Pending",
      positive: typeof newLeads === "number" && newLeads > 0,
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-100 rounded-xl px-5 py-4"
        >
          <p className="text-[12px] text-gray-400 mb-1">{stat.label}</p>
          <p className="text-[32px] font-semibold text-gray-900 leading-none">
            {stat.value}
          </p>
          <p className={`text-[12px] mt-2 flex items-center gap-1 ${stat.positive ? "text-green-600" : "text-gray-400"}`}>
            {stat.positive && <TrendingUp size={11} />}
            {stat.sub}
          </p>
        </div>
      ))}
    </div>
  );
}