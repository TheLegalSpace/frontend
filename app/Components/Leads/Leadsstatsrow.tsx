"use client";

import { TrendingUp } from "lucide-react";
import { Lead } from "@/app/types/leads";

interface Props {
  leads: Lead[];
  total: number;
  profileViews?: number; // optional — wire up when API supports it
}

function countThisMonth(leads: Lead[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return leads.filter((l) => new Date(l.createdAt) >= startOfMonth).length;
}

function countThisWeek(leads: Lead[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  return leads.filter((l) => new Date(l.createdAt) >= startOfWeek).length;
}

function calcResponseRate(leads: Lead[]): number {
  if (leads.length === 0) return 0;
  const responded = leads.filter(
    (l) => l.status === "accepted" || l.status === "declined"
  ).length;
  return Math.round((responded / leads.length) * 100);
}

function responseRateLabel(rate: number): string {
  if (rate >= 90) return "Excellent";
  if (rate >= 70) return "Good";
  if (rate >= 50) return "Average";
  return "Needs improvement";
}

export default function LeadsStatsRow({ leads, total, profileViews = 0 }: Props) {
  const thisMonth = countThisMonth(leads);
  const thisWeek = countThisWeek(
    leads.filter((l) => l.status === "pending")
  );
  const responseRate = calcResponseRate(leads);

  const stats = [
    {
      label: "Total Leads",
      value: total,
      sub: thisMonth > 0 ? `↑ ${thisMonth} this month` : "No new leads this month",
      positive: thisMonth > 0,
    },
    {
      label: "New Leads",
      value: leads.filter((l) => l.status === "pending").length,
      sub: thisWeek > 0 ? `↑ ${thisWeek} this week` : "None this week",
      positive: thisWeek > 0,
    },
    {
      label: "Profile Views",
      value: profileViews,
      sub: profileViews > 0 ? `${profileViews} total views` : "No data yet",
      positive: profileViews > 0,
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      sub: responseRateLabel(responseRate),
      positive: responseRate >= 70,
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