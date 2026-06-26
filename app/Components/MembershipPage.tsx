"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Download } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

import type {
  MembershipView,
  Invoice,
  BillingRole,
  PlanView,
} from "../types/membership";

import { membershipService, formatNaira } from "@/services/membership.services";

// ── Small components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Invoice["status"] }) {
  const styles = {
    paid:    "bg-green-50 text-green-700 border-green-200",
    pending: "bg-orange-50 text-orange-600 border-orange-200",
    failed:  "bg-red-50 text-red-600 border-red-200",
  };
  const dots = {
    paid:    "bg-green-500",
    pending: "bg-orange-500",
    failed:  "bg-red-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-medium ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CardIcon({ brand }: { brand: string }) {
  if (brand.toLowerCase() === "mastercard") {
    return (
      <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
        <rect width="32" height="20" rx="3" fill="#f5f5f5" />
        <circle cx="12" cy="10" r="7" fill="#EB001B" />
        <circle cx="20" cy="10" r="7" fill="#F79E1B" />
        <path d="M16 4.8a7 7 0 0 1 0 10.4A7 7 0 0 1 16 4.8z" fill="#FF5F00" />
      </svg>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-5 rounded bg-blue-600 text-white text-[9px] font-bold uppercase tracking-wide">
      {brand.slice(0, 4)}
    </span>
  );
}

function DaysRing({
  daysLeft,
  totalDays,
  expiresAt,
}: {
  daysLeft: number;
  totalDays: number;
  expiresAt: string;
}) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.max(0, Math.min(1, daysLeft / totalDays));
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#F0F0F0" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r} fill="none" stroke="#22C55E" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-bold text-gray-900 leading-none">{daysLeft}</span>
          <span className="text-[12px] text-gray-500 mt-0.5">days left</span>
        </div>
      </div>
      <p className="text-[12px] text-gray-500">
        Expires: <span className="font-medium text-gray-700">{expiresAt}</span>
      </p>
    </div>
  );
}

function FreeRing() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#F0F0F0" strokeWidth="8" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-bold text-gray-900 leading-none">Free</span>
          <span className="text-[12px] text-gray-500 mt-0.5">Forever</span>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
        ${checked ? "bg-blue-600" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-6 mb-5">
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
      {message}
    </div>
  );
}

// ── Pro subscriber view ───────────────────────────────────────────────────────

function ProView({
  membership,
  invoices,
  onMembershipUpdate,
}: {
  membership: MembershipView;
  invoices: Invoice[];
  onMembershipUpdate: (m: MembershipView) => void;
}) {
  const [autoRenewLoading, setAutoRenewLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cardLoading, setCardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = membership.plan!;
  const pm = membership.paymentMethod;

  const expiresAt = membership.currentPeriodEnd
    ? new Date(membership.currentPeriodEnd).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : null;

  const totalDays = (() => {
    if (!membership.currentPeriodStart || !membership.currentPeriodEnd) return 180;
    const start = new Date(membership.currentPeriodStart).getTime();
    const end   = new Date(membership.currentPeriodEnd).getTime();
    return Math.round((end - start) / 86_400_000);
  })();

  async function handleAutoRenewToggle(value: boolean) {
    setError(null);
    setAutoRenewLoading(true);
    try {
      const res = await membershipService.setAutoRenew(value);
      if (res.data) onMembershipUpdate(res.data);
    } catch (err: any) {
      setError(
        err?.response?.status === 503
          ? "Still finishing setup — try again in a moment."
          : err?.response?.data?.message ?? "Failed to update auto-renewal."
      );
    } finally {
      setAutoRenewLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel your renewal? Your membership stays active until the period ends.")) return;
    setError(null);
    setCancelLoading(true);
    try {
      const res = await membershipService.cancel();
      if (res.data) onMembershipUpdate(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleUpdateCard() {
    setError(null);
    setCardLoading(true);
    try {
      const res = await membershipService.getPaymentMethodUpdateLink();
      if (res.data?.link) window.open(res.data.link, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to get card update link.");
    } finally {
      setCardLoading(false);
    }
  }

  async function handleInvoiceDownload(invoice: Invoice) {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const res = await membershipService.getInvoiceDownloadUrl(invoice.id);
      if (res.data?.url) window.open(res.data.url, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to get invoice download link.");
    }
  }

  const isCancelled =
    membership.status === "non_renewing" || membership.status === "cancelled";

  return (
    <>
      {error && <ErrorBanner message={error} />}

      <Section>
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Current Subscription
            </p>
            <h2 className="text-[26px] font-['Instrument_Serif'] text-gray-900 mb-2">
              {plan.name}
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
              {plan.features[0] ?? "Full access to professional tools and resources."}
            </p>
            <div className="flex gap-8 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Billing Cycle</p>
                <p className="text-[13px] font-semibold text-gray-900">
                  Every {plan.intervalMonths} Months
                </p>
              </div>
              {expiresAt && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
                    {isCancelled ? "Access Until" : "Next Renewal"}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-900">{expiresAt}</p>
                </div>
              )}
            </div>
            {!isCancelled ? (
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="px-4 py-2 rounded-lg border border-gray-300 text-[13px] text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {cancelLoading ? "Cancelling…" : "Cancel subscription"}
              </button>
            ) : (
              <p className="text-[13px] text-orange-600 font-medium">
                Renewal cancelled — access continues until {expiresAt}.
              </p>
            )}
          </div>

          <div className="w-52 shrink-0 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center py-6">
            {membership.daysRemaining !== null && expiresAt
              ? <DaysRing daysLeft={membership.daysRemaining} totalDays={totalDays} expiresAt={expiresAt} />
              : <FreeRing />
            }
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Auto Renewal
            </p>
            <p className="text-[14px] text-gray-800 font-medium">
              Automatically renew your membership at the end of each billing cycle.
            </p>
          </div>
          <Toggle
            checked={membership.autoRenew}
            onChange={handleAutoRenewToggle}
            disabled={autoRenewLoading || isCancelled}
          />
        </div>
      </Section>

      {pm && (
        <Section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-1">
                Billing
              </p>
              <h3 className="text-[17px] font-semibold text-gray-900">Payment method</h3>
            </div>
            <button
              onClick={handleUpdateCard}
              disabled={cardLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-[13px] text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              {cardLoading ? "Loading…" : "Update Payment Method"}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <CardIcon brand={pm.cardBrand} />
            <div>
              <p className="text-[14px] font-medium text-gray-900">
                •••• •••• •••• {pm.cardLast4}
              </p>
              <p className="text-[12px] text-gray-400">
                {pm.bank} · Expires {pm.expMonth}/{pm.expYear}
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-1">
              Records
            </p>
            <h3 className="text-[17px] font-semibold text-gray-900">Billing history</h3>
          </div>
        </div>
        {invoices.length === 0 ? (
          <p className="text-[13px] text-gray-400">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Invoice #", "Date", "Plan", "Amount", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-[11px] text-gray-400 font-medium pb-3 pr-4 last:pr-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50 last:border-none">
                    <td className="py-3.5 pr-4 text-gray-700 font-medium">{inv.invoiceNumber}</td>
                    <td className="py-3.5 pr-4 text-gray-500">
                      {new Date(inv.issuedAt).toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 pr-4 text-blue-600">{inv.planName}</td>
                    <td className="py-3.5 pr-4 text-gray-900 font-medium">
                      {formatNaira(inv.amountKobo)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => handleInvoiceDownload(inv)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-[12px] text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
                      >
                        <Download size={11} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}

// ── Community (free) view ─────────────────────────────────────────────────────

function CommunityView({
  membership,
  billingRole,
}: {
  membership: MembershipView;
  billingRole: BillingRole;
}) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const communityPlan = membership.availablePlans.find((p) => p.tier === "community");
  const proPlan       = membership.availablePlans.find(
    (p) => p.tier === "professional" && p.forRole === billingRole
  );

  // The API has a 6-month plan; annual price is derived (×2) client-side.
  const basePriceKobo    = proPlan?.priceKobo ?? 0;
  const displayPriceKobo = isAnnual ? basePriceKobo * 2 : basePriceKobo;
  const proCycle         = isAnnual ? "Annually" : `Every ${proPlan?.intervalMonths ?? 6} Months`;
  const isFirm           = billingRole === "FIRM";

  const communityFeatures = communityPlan?.features ?? [
    "Professional Profile",
    "Publish Articles",
    "Community Visibility",
    "Access to Public Events",
    "TLS Services",
  ];

  async function handleSubscribe() {
    setError(null);
    setLoading(true);
    try {
      const res = await membershipService.subscribe();
      if (res.data?.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      }
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setError("Your account already has an active membership.");
      } else {
        setError(err?.response?.data?.message ?? "Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  }

  return (
    <>
      {error && <ErrorBanner message={error} />}

      <Section>
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Current Subscription
            </p>
            <h2 className="text-[26px] font-['Instrument_Serif'] text-gray-900 mb-2">
              Community Membership
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
              Establish your professional presence on The Legal Space and connect with
              the legal community through your public profile, articles, events, and
              platform visibility.
            </p>
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Billing Cycle</p>
              <p className="text-[13px] font-semibold text-gray-900">Free Forever</p>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition disabled:opacity-60"
            >
              {loading
                ? "Redirecting to checkout…"
                : `Upgrade to ${proPlan?.name ?? (isFirm ? "Firm Membership" : "Professional Membership")}`}
            </button>
          </div>
          <div className="w-52 shrink-0 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center py-6">
            <FreeRing />
          </div>
        </div>
      </Section>

      <div className="mb-5">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-1">Plans</p>
        <h3 className="text-[20px] font-semibold text-gray-900 mb-4">Change plan</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Community card */}
          <div className="border-2 border-blue-100 bg-blue-50/30 rounded-xl p-5">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[12px] font-medium mb-4">
              Forever
            </div>
            <div className="mb-1">
              <span className="text-[32px] font-bold text-gray-900">₦Free</span>
            </div>
            <p className="text-[13px] text-gray-500 mb-5">
              Establish your presence on The Legal Space.
            </p>
            <ul className="space-y-2.5 mb-6">
              {communityFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[13px] text-gray-700">
                  <Check size={15} className="text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="border border-gray-200 rounded-lg py-2.5 text-center text-[13px] font-medium text-gray-500 bg-white">
              Current Plan
            </div>
          </div>

          {/* Professional card */}
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[12px] font-medium">
                {proCycle}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-gray-500">
                Annually
                <Toggle checked={isAnnual} onChange={setIsAnnual} />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-[32px] font-bold text-gray-900">
                {formatNaira(displayPriceKobo)}
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mb-5">
              {isFirm
                ? "Designed for law firms looking to grow their visibility, manage their team, and access premium tools."
                : "Access the full experience designed for modern legal professionals."}
            </p>
            <ul className="space-y-2.5 mb-6">
              {(proPlan?.features ?? []).map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-gray-700">
                  <Check size={15} className="text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-medium rounded-lg text-center transition disabled:opacity-60"
            >
              {loading ? "Redirecting…" : `Choose ${isFirm ? "Firm" : "Professional"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MembershipPage() {
  const { user } = useAuth();

  const [membership, setMembership] = useState<MembershipView | null>(null);
  const [invoices,   setInvoices]   = useState<Invoice[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [pageError,  setPageError]  = useState<string | null>(null);

  const role = user?.role;
  const billingRole: BillingRole | null =
    role === "LAWYER" || role === "PENDING_PROFESSIONAL" ? "LAWYER" :
    role === "FIRM" ? "FIRM" :
    null;

  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const [membershipRes, invoicesRes] = await Promise.all([
        membershipService.getMembership(),
        membershipService.getInvoices(),
      ]);
      if (membershipRes.data) setMembership(membershipRes.data);
      if (invoicesRes.data)   setInvoices(invoicesRes.data.items);
    } catch (err: any) {
      setPageError(err?.response?.data?.message ?? "Failed to load membership.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Handle Paystack redirect back: verify payment then clean up the URL
    const params    = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (reference) {
      membershipService.verifyPayment(reference).then((res) => {
        if (res.data) setMembership(res.data);
        window.history.replaceState({}, "", window.location.pathname);
      });
    }

    loadData();
  }, [loadData]);

  if (!billingRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-[14px] text-gray-400">
          Membership is not available for your account type.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {loading && (
          <div className="flex items-center justify-center py-24 text-[13px] text-gray-400">
            Loading…
          </div>
        )}

        {!loading && pageError && <ErrorBanner message={pageError} />}

        {!loading && membership && (
          membership.tier === "professional" ? (
            <ProView
              membership={membership}
              invoices={invoices}
              onMembershipUpdate={setMembership}
            />
          ) : (
            <CommunityView
              membership={membership}
              billingRole={billingRole}
            />
          )
        )}
      </div>
    </div>
  );
}