// app/Components/Admin/Subscriptions/SubscriptionsPage.tsx
// Figma source: Subscriptions.png
"use client";

import { Check, Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import { formatNaira, formatPercent } from "../shared/format";
import { useAdminSubscriptions, useUpdateSubscriptionPlan } from "@/hooks/useAdmin";
import { SubscriptionPlan } from "@/app/types/admin";

function PlanCard({ plan }: { plan: SubscriptionPlan }) {
  const updatePlan = useUpdateSubscriptionPlan();
  const price = plan.isAnnual ? plan.priceAnnual : plan.priceMonthly;

  function toggleBilling() {
    updatePlan.mutate({ planId: plan.id, payload: { isAnnual: !plan.isAnnual } });
  }

  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden flex-1 min-w-0">
      <div className="bg-blue-50 px-6 py-3.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-blue-700">
          {plan.billingLabel}
        </span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-[12px] text-gray-600">Annually</span>
          <button
            onClick={toggleBilling}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              plan.isAnnual ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                plan.isAnnual ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      <div className="p-6">
        <p className="font-[Instrument_Serif] text-[34px] leading-none text-gray-900 mb-3">
          {formatNaira(price)}
        </p>
        <p className="text-[13px] text-gray-500 mb-4">{plan.description}</p>
        <div className="h-px bg-gray-100 mb-4" />

        <div className="flex flex-col gap-2.5 mb-5">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <Check size={11} className="text-green-600" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="h-px bg-gray-100 mb-4" />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px] text-gray-500">User Count:</span>
          <span className="text-[15px] font-semibold text-gray-900">
            {plan.userCount.toLocaleString()} {plan.userCountLabel}
          </span>
        </div>

        <button className="w-full py-2.5 border border-gray-300 rounded-lg text-[13px] font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
          Edit Plan
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { data, isLoading } = useAdminSubscriptions();
  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Subscriptions" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Active Subscribers"
            value={(stats?.activeSubscribers ?? 0).toLocaleString()}
            sub={formatPercent(stats?.activeSubscribersGrowth)}
            trend="up"
          />
          <StatCard
            label="Monthly Revenue"
            value={formatNaira(stats?.monthlyRevenue ?? 0)}
            sub={formatPercent(stats?.monthlyRevenueGrowth, "from last month")}
            trend="up"
          />
          <StatCard
            label="Annual Revenue"
            value={formatNaira(stats?.annualRevenue ?? 0)}
            sub={formatPercent(stats?.annualRevenueGrowth, "from last year")}
            trend="up"
          />
          <StatCard
            label="Churn Rate"
            value={`${stats?.churnRate ?? 0}%`}
            sub={formatPercent(stats?.churnRateChange)}
            trend="down"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading plans...
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-5">
            {data?.plans?.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
