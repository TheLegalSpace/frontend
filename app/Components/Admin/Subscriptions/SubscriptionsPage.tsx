// app/Components/Admin/Subscriptions/SubscriptionsPage.tsx
"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import { formatNaira } from "../shared/format";
import {
  useAdminSubscriptions,
  useUpdateSubscriptionPlan,
} from "@/hooks/useAdmin";
import { SubscriptionPlan } from "@/app/types/admin";

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  destructive,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-[13px] text-gray-700 hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium text-white transition ${
              destructive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
}: {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
}) {
  const price = plan.priceKobo / 100;
  const billingLabel = `Every ${plan.intervalMonths} Months`;
  const subscriberLabel =
    plan.forRole === "LAWYER"
      ? "lawyers"
      : plan.forRole === "FIRM"
        ? "firms"
        : "subscribers";

  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden flex-1 min-w-0">
      <div className="bg-blue-50 px-6 py-3.5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-blue-700">
          {billingLabel}
        </span>
      </div>

      <div className="p-6">
        <p className="font-[Instrument_Serif] text-[34px] leading-none text-gray-900 mb-3">
          {formatNaira(price)}
        </p>
        <p className="text-[13px] text-gray-500 mb-4">{plan.name}</p>
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
          <span className="text-[13px] text-gray-500">Subscribers:</span>
          <span className="text-[15px] font-semibold text-gray-900">
            {plan.subscriberCount.toLocaleString()} {subscriberLabel}
          </span>
        </div>

        <button
          onClick={() => onEdit(plan)}
          className="w-full py-2.5 border border-gray-300 rounded-lg text-[13px] font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
        >
          Edit Plan
        </button>
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { data, isLoading } = useAdminSubscriptions();
  const updatePlan = useUpdateSubscriptionPlan();
  const stats = data;

  // Safely access stats with fallbacks
  const monthlyRevenue = (stats?.monthlyRevenueKobo ?? 0) / 100;
  const annualRevenue = (stats?.allTimeRevenueKobo ?? 0) / 100;
  const churnRate = stats?.churnRate ?? 0;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [name, setName] = useState("");
  const [priceNaira, setPriceNaira] = useState("");
  const [features, setFeatures] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPayload, setPendingPayload] =
    useState<Partial<SubscriptionPlan> | null>(null);

  const openEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setName(plan.name);
    setPriceNaira(String(plan.priceKobo / 100));
    setFeatures(plan.features.join("\n"));
    setIsActive(plan.isActive);
    setShowConfirm(false);
    setPendingPayload(null);
  };

  const closeModal = () => {
    setSelectedPlan(null);
    setShowConfirm(false);
    setPendingPayload(null);
  };

  const buildPayload = (): Omit<Partial<SubscriptionPlan>, "isLoading"> => {
    if (!selectedPlan) return {};

    const payload: Omit<Partial<SubscriptionPlan>, "isLoading"> = {};

    if (name !== selectedPlan.name) payload.name = name;

    const priceValue = Number(priceNaira);
    if (!Number.isNaN(priceValue)) {
      const priceKobo = Math.round(priceValue * 100);
      if (priceKobo !== selectedPlan.priceKobo) payload.priceKobo = priceKobo;
    }

    const featureList = features
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (JSON.stringify(featureList) !== JSON.stringify(selectedPlan.features)) {
      payload.features = featureList;
    }

    if (isActive !== selectedPlan.isActive) payload.isActive = isActive;

    return payload;
  };

  const handleSave = () => {
    if (!selectedPlan) return;

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      closeModal();
      return;
    }

    const priceChanged =
      payload.priceKobo !== undefined &&
      payload.priceKobo !== selectedPlan.priceKobo;
    if (priceChanged) {
      setPendingPayload(payload);
      setShowConfirm(true);
      return;
    }

    updatePlan.mutate(
      { planId: selectedPlan.id, payload },
      { onSuccess: closeModal },
    );
  };

  const handleConfirmPriceChange = () => {
    if (!selectedPlan || !pendingPayload) return;
    updatePlan.mutate(
      { planId: selectedPlan.id, payload: pendingPayload },
      { onSuccess: closeModal },
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Subscriptions" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Active Subscribers"
            value={(stats?.activeSubscribers ?? 0).toLocaleString()}
          />
          <StatCard
            label="Monthly Revenue"
            value={formatNaira(monthlyRevenue)}
          />
          <StatCard label="Annual Revenue" value={formatNaira(annualRevenue)} />
          <StatCard label="Churn Rate" value={`${churnRate}%`} />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading plans...
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-5">
            {data?.plans?.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onEdit={openEditModal} />
            ))}
          </div>
        )}

        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-10">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                aria-label="Close edit plan"
              >
                ✕
              </button>
              <h2 className="text-[20px] font-semibold text-gray-900 mb-4">
                Edit Plan
              </h2>
              <div className="grid gap-4">
                <label className="block">
                  <span className="text-[13px] text-gray-500">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] text-gray-500">Price (NGN)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={priceNaira}
                    onChange={(e) => setPriceNaira(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] text-gray-500">Features</span>
                  <textarea
                    rows={5}
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-2">
                    One feature per line.
                  </p>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-[13px] text-gray-700">
                    Plan is active
                  </span>
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-[13px] text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updatePlan.isPending}
                  className="px-5 py-3 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {updatePlan.isPending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirm && selectedPlan && (
          <ConfirmDialog
            title="Confirm price change"
            description="Changing the plan price will create a new Paystack plan under the hood. Existing subscribers will keep their current billing until they resubscribe."
            confirmLabel={
              updatePlan.isPending ? "Saving…" : "Confirm price change"
            }
            onConfirm={handleConfirmPriceChange}
            onCancel={() => setShowConfirm(false)}
            destructive
          />
        )}
      </div>
    </div>
  );
}
