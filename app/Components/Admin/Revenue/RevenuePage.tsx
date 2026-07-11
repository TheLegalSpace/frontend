// app/Components/Admin/Revenue/RevenuePage.tsx
// Figma source: Revenue.png
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import TablePagination from "../shared/TablePagination";
import { formatNaira, formatNairaFull, formatPercent } from "../shared/format";
import { useAdminRevenue } from "@/hooks/useAdmin";

export default function RevenuePage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminRevenue({ page, limit: 8 });
  const stats = data?.stats;
  // Use kobo-based fields returned by the API and convert to naira for display
  const totalRevenue = stats?.totalRevenueKobo ? stats.totalRevenueKobo / 100 : 0;
  const revenueThisMonth = stats?.revenueThisMonthKobo ? stats.revenueThisMonthKobo / 100 : 0;
  const rows = data?.monthly ?? [];

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Revenue" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Revenue"
            value={formatNaira(totalRevenue)}
            sub={formatPercent(stats?.totalRevenueGrowth)}
            trend="up"
          />
          <StatCard
            label="Revenue This Month"
            value={formatNaira(revenueThisMonth)}
            sub={formatPercent(stats?.revenueThisMonthGrowth)}
            trend="up"
          />
          <StatCard
            label="Subscription Revenue"
            value={formatNaira((stats?.subscriptionRevenueKobo ?? 0) / 100)}
            sub="All time"
          />
          <StatCard
            label="On The Docket Revenue"
            value={formatNaira((stats?.onTheDocketRevenueKobo ?? 0) / 100)}
            sub="All time"
          />
        </div>

        <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-[14px] font-semibold text-gray-900">
              Monthly Revenue Breakdown
            </h2>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {["Month", "Subscriptions", "On The Docket", "Total", "Growth"].map(
                  (h) => (
                    <th key={h} className="text-[12px] font-semibold text-gray-600 px-5 py-3">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Loading revenue...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-400 text-[13px]">
                    No revenue data yet.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={`${row.month}-${i}`} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="px-5 py-3.5 text-[13px] text-gray-800">{row.month}</td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-700">
                          {formatNairaFull((row.subscriptionsKobo ?? 0) / 100)}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-700">
                          {formatNairaFull((row.onTheDocketKobo ?? 0) / 100)}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-gray-900">
                          {formatNairaFull((row.totalKobo ?? 0) / 100)}
                        </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-medium ${
                          row.growth >= 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {row.growth >= 0 ? "+" : ""}
                        {row.growth}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <TablePagination
            page={data?.pagination?.page ?? 1}
            totalPages={data?.pagination?.totalPages ?? 1}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
