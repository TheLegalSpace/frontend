// app/Components/Admin/SupportCenter/SupportCenterPage.tsx
// Figma source: Support Center.png, Support Center-1.png
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import StatusBadge from "../shared/StatusBadge";
import TableToolbar from "../shared/TableToolbar";
import TablePagination from "../shared/TablePagination";
import { useSupportStats, useSupportTickets } from "@/hooks/useAdmin";
import { formatDate } from "../shared/format";

const STATUS_OPTIONS = [
  { label: "Open", value: "Open" },
  { label: "In Progress", value: "In Progress" },
  { label: "Closed", value: "Closed" },
];

const SERVICE_OPTIONS = [
  { label: "Billing", value: "Billing" },
  { label: "Verification", value: "Verification" },
  { label: "Technical", value: "Technical" },
];

export default function SupportCenterPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data: stats } = useSupportStats();
  const { data, isLoading } = useSupportTickets({
    page,
    limit: 8,
    q: search || undefined,
    category: service || undefined,
    status: status || undefined,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Support Center" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <StatCard
            label="Total Tickets"
            value={(stats?.totalTickets ?? 0).toLocaleString()}
          />
          <StatCard
            label="Open Tickets"
            value={(stats?.openTickets ?? 0).toLocaleString()}
          />
          <StatCard
            label="Closed Tickets"
            value={(stats?.closedTickets ?? 0).toLocaleString()}
          />
        </div>

        <TableToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          filters={[
            {
              label: "All Services",
              value: service,
              options: SERVICE_OPTIONS,
              onChange: (v) => {
                setService(v);
                setPage(1);
              },
            },
            {
              label: "All Status",
              value: status,
              options: STATUS_OPTIONS,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              },
            },
          ]}
          onPrint={() => window.print()}
        />

        <div className="border border-[#E5E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left min-w-200">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {[
                  "Ticket ID",
                  "User",
                  "Subject",
                  "Date Submitted",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-[12px] font-semibold text-gray-600 px-5 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Loading tickets...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-gray-400 text-[13px]"
                  >
                    No tickets found.
                  </td>
                </tr>
              ) : (
                items.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-[#F3F4F6] last:border-0"
                  >
                    <td className="px-5 py-3.5 text-[13px] text-gray-800 whitespace-nowrap">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                      {ticket.name}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700">
                      {ticket.subject}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                      {formatDate(ticket.dateSubmitted)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() =>
                          router.push(`/admin/support/${ticket.id}`)
                        }
                        className="px-4 py-1.5 border border-gray-300 rounded-lg text-[12.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <TablePagination
            page={pagination?.page ?? 1}
            totalPages={pagination?.totalPages ?? 1}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
