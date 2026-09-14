// app/Components/Admin/SupportCenter/TicketDetailPage.tsx
// Figma source: On the Docket-5.png (ticket detail screen, mislabeled in the export)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import StatusBadge from "../shared/StatusBadge";
import { formatDateTime } from "../shared/format";
import { useSupportTicket, useUpdateSupportTicketStatus } from "@/hooks/useAdmin";
import { TicketStatus } from "@/app/types/admin";

const STATUS_OPTIONS: TicketStatus[] = ["open", "in_progress", "closed"];

export default function TicketDetailPage({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const updateStatus = useUpdateSupportTicketStatus();
  const [draftStatus, setDraftStatus] = useState<TicketStatus | null>(null);

  if (isLoading || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 gap-2">
        <Loader2 size={16} className="animate-spin" />
        Loading ticket...
      </div>
    );
  }

  const ticketStatus = ticket.status;
  const status = draftStatus ?? ticketStatus;

  async function handleUpdate() {
    if (!draftStatus || draftStatus === ticketStatus) return;
    await updateStatus.mutateAsync({ ticketId, status: draftStatus });
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/support")}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-[Instrument_Serif] text-[22px] leading-none font-light text-[#1F2937]">
            {ticket.ticketRef}
          </h1>
        </div>
        <StatusBadge status={ticket.status} />
      </div>

      <div className="px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 border border-[#E5E7EB] rounded-xl p-5">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Ticket Details</h2>
          <dl className="flex flex-col gap-3.5 text-[13px] mb-5">
            <Row label="Name" value={ticket.name} />
            <Row label="Email" value={ticket.email} />
            <Row label="Category" value={ticket.category} />
            <Row label="Created" value={formatDateTime(ticket.createdAt)} />
          </dl>
          <div className="h-px bg-gray-100 mb-4" />
          <p className="text-[13px] text-gray-700 leading-relaxed">{ticket.message}</p>
        </div>

        <div className="border border-[#E5E7EB] rounded-xl p-5 h-fit">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Ticket Status</h2>
          <label className="block text-[12px] text-gray-500 mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setDraftStatus(e.target.value as TicketStatus)}
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-6 focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={handleUpdate}
            disabled={updateStatus.isPending || status === ticketStatus}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updateStatus.isPending && <Loader2 size={14} className="animate-spin" />}
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-gray-400 shrink-0">{label}</dt>
      <dd className="text-gray-900 font-semibold text-right">{value}</dd>
    </div>
  );
}
