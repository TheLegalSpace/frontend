// app/Components/Admin/Analytics/AnalyticsPage.tsx
// Figma source: Analytics.png
"use client";

import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import { formatPercent } from "../shared/format";
import { useAnalytics } from "@/hooks/useAdmin";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Analytics" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Daily Active Users"
            value={(data?.dailyActiveUsers ?? 0).toLocaleString()}
            sub={formatPercent(data?.dailyActiveUsersGrowth)}
            trend="up"
          />
          <StatCard
            label="Monthly Active Users"
            value={(data?.monthlyActiveUsers ?? 0).toLocaleString()}
            sub={formatPercent(data?.monthlyActiveUsersGrowth)}
            trend="up"
          />
          <StatCard
            label="Avg Session Duration"
            value={data?.avgSessionDuration ?? "—"}
            sub={data?.avgSessionDurationGrowth ? `↑ ${data.avgSessionDurationGrowth}` : undefined}
            trend="up"
          />
          <StatCard
            label="Page Views"
            value={(data?.pageViews ?? 0).toLocaleString()}
            sub={formatPercent(data?.pageViewsGrowth)}
            trend="up"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading analytics...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="border border-[#E5E7EB] rounded-xl p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Most Visited Pages</h2>
              <div className="flex flex-col gap-3">
                {data?.mostVisitedPages?.map((p) => (
                  <div key={p.label} className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-500">{p.label}</span>
                    <span className="text-gray-900 font-medium">{p.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-xl p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Search Insights</h2>
              <p className="text-[11px] tracking-wide text-gray-400 uppercase mb-3">
                Top Search Queries
              </p>
              <div className="flex flex-col gap-3">
                {data?.topSearchQueries?.map((q) => (
                  <div key={q.query} className="flex items-center justify-between text-[13px]">
                    <span className="text-blue-600">&quot;{q.query}&quot;</span>
                    <span className="text-gray-900 font-medium">{q.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#E5E7EB] rounded-xl p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Platform Statistics</h2>
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Desktop Users</span>
                  <span className="text-gray-900 font-medium">{data?.platformStats?.desktopUsers ?? "—"}%</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Mobile Users</span>
                  <span className="text-gray-900 font-medium">{data?.platformStats?.mobileUsers ?? "—"}%</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Tablet Users</span>
                  <span className="text-gray-900 font-medium">{data?.platformStats?.tabletUsers ?? "—"}%</span>
                </div>
              </div>
              <div className="h-px bg-gray-100 mb-4" />
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Avg Load Time</span>
                  <span className="text-gray-900 font-medium">{data?.platformStats?.avgLoadTime ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Bounce Rate</span>
                  <span className="text-gray-900 font-medium">{data?.platformStats?.bounceRate ?? "—"}%</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Pages per Session</span>
                  <span className="text-gray-900 font-medium">{data?.platformStats?.pagesPerSession ?? "—"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
