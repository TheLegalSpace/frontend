// app/Components/Admin/TLSServices/EnquiryDetailModal.tsx
// Figma source: TLS Services-2.png
"use client";

import { X, Loader2 } from "lucide-react";
import { TlsServiceStatus } from "@/app/types/admin";
import { useTlsServiceEnquiry, useUpdateTlsServiceStatus } from "@/hooks/useAdmin";

interface Props {
  enquiryId: string;
  onClose: () => void;
}

const STATUS_BUTTONS: { label: string; status: TlsServiceStatus; style: string }[] = [
  { label: "New Lead", status: "New", style: "bg-blue-600 hover:bg-blue-700 text-white" },
  { label: "Lose Lead", status: "Lead Lost", style: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
  { label: "Lead in Progress", status: "In Progress", style: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
  { label: "Close Lead", status: "Closed", style: "border border-gray-300 text-gray-700 hover:bg-gray-50" },
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

export default function EnquiryDetailModal({ enquiryId, onClose }: Props) {
  const { data: enquiry, isLoading } = useTlsServiceEnquiry(enquiryId);
  const updateStatus = useUpdateTlsServiceStatus();

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
              <Field label="Law Firm Name" value={enquiry.lawFirmName} />
              <Field label="Full Name" value={enquiry.fullName} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Email Address" value={enquiry.email} />
              <Field label="Phone Number" value={enquiry.phone} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="What do you need?" value={enquiry.serviceNeeded} />
              <Field label="Do you currently have a website?" value={enquiry.hasWebsite} />
            </div>
            {enquiry.currentWebsiteUrl && (
              <div className="mb-5">
                <Field label="Current Website URL" value={enquiry.currentWebsiteUrl} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">
              {STATUS_BUTTONS.map((btn) => (
                <button
                  key={btn.status}
                  disabled={updateStatus.isPending}
                  onClick={() =>
                    updateStatus.mutate({ enquiryId, status: btn.status })
                  }
                  className={`py-3 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-60 ${btn.style} ${
                    enquiry.status === btn.status ? "ring-2 ring-offset-1 ring-blue-300" : ""
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
