// app/Components/Admin/Dashboard/AdminDashboardPage.tsx
// Figma source: Dashboard.png
"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { formatNaira, formatPercent, timeAgo } from "../shared/format";

const QUICK_ACTIONS = [
  { label: "TLS Services", href: "/admin/services" },
  { label: "Users", href: "/admin/users" },
  { label: "Support Center", href: "/admin/support" },
  { label: "Events", href: "/admin/docket" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard();
  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Dashboard" />

      <div className="px-6 md:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading dashboard...
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
              <StatCard
                label="Total Revenue"
                value={formatNaira(stats?.totalRevenue ?? 0)}
                sub={formatPercent(stats?.totalRevenueGrowth, "this month")}
                trend="up"
              />
              <StatCard
                label="Total Users"
                value={(stats?.totalUsers ?? 0).toLocaleString()}
                sub={formatPercent(stats?.totalUsersGrowth, "this month")}
                trend="up"
              />
              <StatCard
                label="Active Subscribers"
                value={(stats?.activeSubscribers ?? 0).toLocaleString()}
                sub={formatPercent(stats?.activeSubscribersGrowth, "this month")}
                trend="up"
              />
              <StatCard
                label="New Enquiries"
                value={(stats?.newEnquiries ?? 0).toLocaleString()}
                sub={formatPercent(stats?.newEnquiriesGrowth, "this week")}
                trend="up"
              />
              <StatCard
                label="On the Docket"
                value={(stats?.onTheDocket ?? 0).toLocaleString()}
                sub={formatPercent(stats?.onTheDocketGrowth, "this month")}
                trend="down"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Recent activities */}
              <div className="xl:col-span-2 border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E7EB]">
                  <h2 className="text-[14px] font-semibold text-gray-900">
                    Recent Activities
                  </h2>
                </div>
                <div>
                  {data?.recentActivities?.length ? (
                    data.recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="px-5 py-4 border-b border-[#F3F4F6] last:border-0"
                      >
                        <p className="text-[13px] text-gray-700">
                          <span className="font-semibold text-gray-900">
                            {activity.actorName}
                          </span>{" "}
                          {activity.description}
                          {typeof activity.amount === "number" && (
                            <span className="font-semibold text-gray-900">
                              {" "}
                              {formatNaira(activity.amount)}
                            </span>
                          )}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-1">
                          {timeAgo(activity.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="px-5 py-8 text-center text-[13px] text-gray-400">
                      No recent activity yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-5">
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E7EB]">
                    <h2 className="text-[14px] font-semibold text-gray-900">
                      Pending Tasks
                    </h2>
                  </div>
                  <div>
                    {data?.pendingTasks?.length ? (
                      data.pendingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="px-5 py-4 border-b border-[#F3F4F6] last:border-0"
                        >
                          <p className="text-[13px] text-gray-700">
                            {task.count} {task.label}
                          </p>
                          <Link
                            href={task.href}
                            className="text-[12px] text-blue-600 hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="px-5 py-8 text-center text-[13px] text-gray-400">
                        Nothing pending. You&apos;re all caught up.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl p-5">
                  <h2 className="text-[14px] font-semibold text-gray-900 mb-3">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="text-center py-2.5 border border-gray-200 rounded-lg text-[12.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
