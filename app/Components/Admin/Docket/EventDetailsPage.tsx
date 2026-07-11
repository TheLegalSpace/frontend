// app/Components/Admin/Docket/EventDetailsPage.tsx
// Figma source: On the Docket-3.png (pending), On the Docket-4.png (approved)
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import StatCard from "../shared/StatCard";
import { formatDate, formatNairaFull } from "../shared/format";
import { useDocketEvent, useUpdateEventStatus } from "@/hooks/useAdmin";

export default function EventDetailsPage({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { data: event, isLoading } = useDocketEvent(eventId);
  const updateStatus = useUpdateEventStatus();

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 gap-2">
        <Loader2 size={16} className="animate-spin" />
        Loading event...
      </div>
    );
  }

  async function setStatus(status: "Approved" | "Rejected") {
    await updateStatus.mutateAsync({ eventId, status });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/docket")}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-[Instrument_Serif] text-[22px] leading-none font-light text-[#1F2937]">
            Event Details
          </h1>
        </div>

        {event.status === "Pending" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatus("Approved")}
              disabled={updateStatus.isPending}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              Approve
            </button>
            <button
              onClick={() => setStatus("Rejected")}
              disabled={updateStatus.isPending}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        ) : (
          <StatusBadge status={event.status} />
        )}
      </div>

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Flyer */}
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <img
              src={event.payload?.flyerUrl}
              alt={`${event.eventName} flyer`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Ad info */}
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Ad Information
            </h2>
            <dl className="flex flex-col gap-3.5 text-[13px]">
              <Row label="Event Name" value={event.eventName ?? ""} />
              {event.additionalInfoUrl && (
                <Row
                  label="Additional Infrmation"
                  value={
                    <a
                      href={event.additionalInfoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Visit Link
                    </a>
                  }
                />
              )}
              {event.tlsSocials !== undefined && (
                <Row
                  label="TLS Socials"
                  value={event.tlsSocials ? "YES" : "NO"}
                />
              )}
              <Row label="Address" value={event.address} />
              <Row label="Name" value={event.contactName} />
              <Row label="Email" value={event.contactEmail} />
              {event.contactPhone && (
                <Row label="Phone" value={event.contactPhone} />
              )}
              <Row
                label="Status"
                value={<StatusBadge status={event.status} />}
              />
            </dl>
          </div>

          {/* Payment info */}
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Payment Information
            </h2>
            {event.payment ? (
              <dl className="flex flex-col gap-3.5 text-[13px]">
                <Row
                  label="Amount Paid"
                  value={formatNairaFull(event.payment.amountPaid)}
                />
                <Row
                  label="Payment Date"
                  value={formatDate(event.payment.paymentDate)}
                />
                <Row
                  label="Payment Method"
                  value={event.payment.paymentMethod}
                />
                <Row label="Duration" value={event.payment.durationLabel} />
                <Row
                  label="Start Date"
                  value={formatDate(event.payment.startDate)}
                />
                <Row
                  label="End Date"
                  value={formatDate(event.payment.endDate)}
                />
              </dl>
            ) : event.amount != null || event.pricing ? (
              <dl className="flex flex-col gap-3.5 text-[13px]">
                <Row
                  label="Amount"
                  value={formatNairaFull(
                    event.amount != null ? event.amount / 100 : undefined,
                  )}
                />
                <Row
                  label="Payment Status"
                  value={event.paymentStatus ?? "—"}
                />
                {event.pricing ? (
                  <>
                    <Row
                      label="Days"
                      value={event.pricing.days?.toString() ?? "—"}
                    />
                    <Row
                      label="Daily Rate"
                      value={formatNairaFull(event.pricing.dailyRateKobo / 100)}
                    />
                    <Row
                      label="Social Addon"
                      value={formatNairaFull(
                        event.pricing.socialAddonKobo / 100,
                      )}
                    />
                    <Row
                      label="Total"
                      value={formatNairaFull(event.pricing.totalKobo / 100)}
                    />
                  </>
                ) : null}
              </dl>
            ) : (
              <div className="text-[13px] text-gray-500">
                No payment information available.
              </div>
            )}
          </div>
        </div>

        {/* Performance metrics */}
        <div className="border border-[#E5E7EB] rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-gray-900">
              Performance Metrics
            </h2>
            <button
              onClick={() => window.print()}
              className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
            >
              <Printer size={15} />
            </button>
          </div>
          {event.metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Total Views"
                value={event.metrics.totalViews?.toLocaleString() ?? "—"}
              />
              <StatCard
                label="Total Clicks"
                value={event.metrics.totalClicks?.toLocaleString() ?? "—"}
              />
              <StatCard
                label="CTR"
                value={
                  event.metrics.ctr != null ? `${event.metrics.ctr}%` : "—"
                }
              />
              <StatCard
                label="Cost Per Click"
                value={formatNairaFull(
                  event.metrics.costPerClickKobo != null
                    ? event.metrics.costPerClickKobo / 100
                    : undefined,
                )}
              />
            </div>
          ) : (
            <div className="text-[13px] text-gray-500">
              No performance metrics available.
            </div>
          )}
        </div>

        {event.metrics?.audience ? (
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <h2 className="text-[14px] font-semibold text-gray-900 mb-4">
              Audience Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AudienceGroup
                title="By Device"
                items={event.metrics.audience.byDevice ?? []}
              />
              <AudienceGroup
                title="By Geography"
                items={event.metrics.audience.byGeography ?? []}
              />
              <AudienceGroup
                title="By User Type"
                items={
                  event.metrics.audience.byUserType
                    ? Object.entries(event.metrics.audience.byUserType).map(
                        ([key, value]) => ({
                          label:
                            key === "lawFirms"
                              ? "Law Firms"
                              : key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (s) => s.toUpperCase()),
                          percent: value.percentage,
                        }),
                      )
                    : []
                }
              />
            </div>
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded-xl p-5 text-[13px] text-gray-500">
            No audience breakdown available.
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-gray-400 shrink-0">{label}</dt>
      <dd className="text-gray-800 font-medium text-right">{value}</dd>
    </div>
  );
}

function AudienceGroup({
  title,
  items,
}: {
  title: string;
  items: { label: string; percent: number }[];
}) {
  return (
    <div>
      <p className="text-[11px] tracking-wide text-gray-400 uppercase mb-3">
        {title}
      </p>
      <div className="flex flex-col gap-2.5">
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-center justify-between text-[13px]"
          >
            <span className="text-gray-600">{item.label}</span>
            <span className="font-medium text-gray-900">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
