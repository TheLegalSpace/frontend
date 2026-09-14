// app/Components/Admin/TLSServices/EnquiryDetailModal.tsx
// Figma source: TLS Services-2.png
"use client";

import { X, Loader2 } from "lucide-react";
import { TlsServiceStatus } from "@/app/types/admin";
import { useServiceRequest, useUpdateServiceRequestStatus } from "@/hooks/useAdmin";

interface Props {
  enquiryId: string;
  onClose: () => void;
}

const STATUS_BUTTONS: { label: string; status: TlsServiceStatus; style: string }[] = [
  { label: "New Lead", status: "new", style: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
  { label: "Lead in Progress", status: "in_progress", style: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
  { label: "Lose Lead", status: "lead_lost", style: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
  { label: "Close Lead", status: "closed", style: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[12px] text-gray-500 mb-1.5">{label}</label>
      <div className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] text-gray-700 truncate">
        {value}
      </div>
    </div>
  );
}

function renderValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default function EnquiryDetailModal({ enquiryId, onClose }: Props) {
  const { data: enquiry, isLoading } = useServiceRequest(enquiryId);
  const updateStatus = useUpdateServiceRequestStatus();

  return (
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-1000000000"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-1000000000 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-[13px] font-medium text-gray-700">
            TLS Enquiry
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {isLoading || !enquiry ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading enquiry...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Service Type" value={renderValue(enquiry.type)} />
              <Field label="Firm Name" value={renderValue(enquiry.firmName)} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Contact Name" value={renderValue(enquiry.contactName)} />
              <Field label="Contact Email" value={renderValue(enquiry.contactEmail)} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Contact Phone" value={renderValue(enquiry.contactPhone)} />
              <Field label="Status" value={renderValue(enquiry.status)} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Payment Status" value={renderValue(enquiry.paymentStatus)} />
              <Field
                label="Amount"
                value={enquiry.amount != null ? `₦${(enquiry.amount / 100).toLocaleString()}` : "—"}
              />
            </div>

            {enquiry.payload && Object.keys(enquiry.payload).length > 0 && (
              <div className="mb-5">
                <div className="mb-3 text-sm font-semibold text-gray-700">Request Details</div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(enquiry.payload as Record<string, unknown>).map(([key, value]) => (
                    <Field key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())} value={renderValue(value)} />
                  ))}
                </div>
              </div>
            )}

            {enquiry.pricing && (
              <div className="mb-5">
                <div className="mb-3 text-sm font-semibold text-gray-700">Pricing</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Days" value={renderValue(enquiry.pricing.days)} />
                  <Field label="Daily Rate" value={`₦${(enquiry.pricing.dailyRateKobo / 100).toLocaleString()}`} />
                  <Field label="Social Addon" value={`₦${(enquiry.pricing.socialAddonKobo / 100).toLocaleString()}`} />
                  <Field label="Total" value={`₦${(enquiry.pricing.totalKobo / 100).toLocaleString()}`} />
                </div>
              </div>
            )}

            {enquiry.event && (
              <div className="mb-5">
                <div className="mb-3 text-sm font-semibold text-gray-700">Linked Event</div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Event Title" value={renderValue(enquiry.event.title)} />
                  <Field label="Event Status" value={renderValue(enquiry.event.status)} />
                  <Field label="Start Date" value={renderValue(enquiry.event.startAt)} />
                  <Field label="End Date" value={renderValue(enquiry.event.endAt)} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">
              {STATUS_BUTTONS.map((btn) => {
                const isSelected = enquiry.status === btn.status;
                const buttonStyle = isSelected
                  ? "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600"
                  : btn.style;

                return (
                  <button
                    key={btn.status}
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: enquiryId, status: btn.status })}
                    className={`py-3 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-60 ${buttonStyle}`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
