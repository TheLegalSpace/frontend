// app/Components/Admin/Analytics/AnalyticsPage.tsx
"use client";

import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import { formatPercent } from "../shared/format";
import { useAnalytics } from "@/hooks/useAdmin";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  // If there's no data or it's loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AdminPageHeader title="Analytics" />
        <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
          <Loader2 size={16} className="animate-spin" />
          Loading analytics...
        </div>
      </div>
    );
  }

  // Handle case where data might be undefined
  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <AdminPageHeader title="Analytics" />
        <div className="px-6 md:px-8 py-6">
          <div className="text-center py-12 text-gray-500">
            No analytics data available
          </div>
        </div>
      </div>
    );
  }

  // Extract data with fallbacks
  const { 
    dailyActiveUsers = 0, 
    monthlyActiveUsers = 0,
    dauTrendPct, // Daily Active Users trend percentage
    series = [] 
  } = data;

  // Calculate growth trends from the series data if available
  const getGrowth = (index: number) => {
    if (!series || series.length < 2) return 0;
    const current = series[series.length - 1]?.value || 0;
    const previous = series[series.length - 2]?.value || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get month-over-month growth for DAU
  const dailyGrowth = dauTrendPct ?? getGrowth(0);
  
  // For MAU, we might need to calculate from series or use a separate metric
  // If the API doesn't provide MAU growth, we can derive it from the series
  const monthlyGrowth = getGrowth(0); // Adjust based on your data

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Analytics" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Daily Active Users"
            value={dailyActiveUsers.toLocaleString()}
            sub={formatPercent(dailyGrowth)}
            trend={dailyGrowth > 0 ? "up" : "down"}
          />
          <StatCard
            label="Monthly Active Users"
            value={monthlyActiveUsers.toLocaleString()}
            sub={formatPercent(monthlyGrowth)}
            trend={monthlyGrowth > 0 ? "up" : "down"}
          />
          <StatCard
            label="DAU Trend"
            value={formatPercent(dauTrendPct)}
            sub={dauTrendPct ? `Last 30 days` : undefined}
            trend={dauTrendPct && dauTrendPct > 0 ? "up" : "down"}
          />
          <StatCard
            label="Data Points"
            value={series.length.toLocaleString()}
            sub="In series"
          />
        </div>

        {/* Show additional analytics data if available */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Series Data - if available */}
          {series.length > 0 && (
            <div className="border border-[#E5E7EB] rounded-xl p-5 lg:col-span-2">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">User Activity Trend</h2>
              <div className="flex flex-col gap-2">
                {series.slice(-7).map((point: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-500">{point.date || `Day ${index + 1}`}</span>
                    <span className="text-gray-900 font-medium">{point.value?.toLocaleString() || 0}</span>
                  </div>
                ))}
              </div>
              {series.length > 7 && (
                <p className="text-[11px] text-gray-400 mt-2">
                  Showing last 7 of {series.length} data points
                </p>
              )}
            </div>
          )}

          {/* Additional stats card if needed */}
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-500">Total Users</span>
                <span className="text-gray-900 font-medium">
                  {(dailyActiveUsers + 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-500">DAU/MAU Ratio</span>
                <span className="text-gray-900 font-medium">
                  {monthlyActiveUsers > 0 
                    ? formatPercent((dailyActiveUsers / monthlyActiveUsers) * 100)
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-500">Growth Trend</span>
                <span className={`font-medium ${dailyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dailyGrowth > 0 ? '↑' : '↓'} {formatPercent(Math.abs(dailyGrowth))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}