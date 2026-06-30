// app/Components/Admin/LegalNewsSurvey/LegalNewsSurveyPage.tsx
// Figma source: Legal News Survey.png
"use client";

import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import { formatPercent } from "../shared/format";
import { useLegalNewsSurvey } from "@/hooks/useAdmin";

function DonutChart({
  segments,
}: {
  segments: { label: string; percent: number; color: string }[];
}) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments.reduce<
    { label: string; percent: number; color: string; dash: number; offset: number }[]
  >((acc, seg) => {
    const dash = (seg.percent / 100) * circumference;
    const prevOffset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
    return [...acc, { ...seg, dash, offset: prevOffset }];
  }, []);

  return (
    <svg viewBox="0 0 180 180" className="w-44 h-44">
      <g transform="rotate(-90 90 90)">
        {arcs.map((seg) => (
          <circle
            key={seg.label}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="28"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </g>
      <circle cx="90" cy="90" r="40" fill="white" />
    </svg>
  );
}

export default function LegalNewsSurveyPage() {
  const { data, isLoading } = useLegalNewsSurvey();

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Legal News Survey" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Responses"
            value={(data?.totalResponses ?? 0).toLocaleString()}
            sub="All time"
          />
          <StatCard
            label="Yes Responses"
            value={(data?.yesResponses ?? 0).toLocaleString()}
            sub={
              data
                ? `${Math.round((data.yesResponses / Math.max(data.totalResponses, 1)) * 100)}%`
                : undefined
            }
          />
          <StatCard
            label="No Responses"
            value={(data?.noResponses ?? 0).toLocaleString()}
            sub={
              data
                ? `${Math.round((data.noResponses / Math.max(data.totalResponses, 1)) * 100)}%`
                : undefined
            }
          />
          <StatCard
            label="Participation Rate"
            value={`${data?.participationRate ?? 0}%`}
            sub={formatPercent(data?.participationRateGrowth)}
            trend="up"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading survey data...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="border border-[#E5E7EB] rounded-xl p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
                Breakdown by User Type
              </h2>
              <div className="flex flex-col gap-3 mb-5">
                {data?.byUserType?.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-500">{row.label}</span>
                    <span className="text-gray-900 font-medium">
                      {row.count.toLocaleString()} responses ({row.percent}%)
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] tracking-wide text-gray-400 uppercase mb-3">
                Top Feature Requests
              </p>
              <div className="flex flex-col gap-3">
                {data?.topFeatureRequests?.map((req) => (
                  <div key={req.label} className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-600">{req.label}</span>
                    <span className="text-gray-900 font-medium">
                      {req.votes.toLocaleString()} votes
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-xl p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-6">
                Response Distribution
              </h2>
              <div className="flex flex-col items-center gap-5">
                <DonutChart segments={data?.distribution ?? []} />
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {data?.distribution?.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-1.5 text-[12px] text-gray-600">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: seg.color }}
                      />
                      {seg.label} — {seg.percent}%
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
