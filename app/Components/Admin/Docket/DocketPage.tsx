// app/Components/Admin/Docket/DocketPage.tsx
// Figma source: On the Docket.png, On the Docket-1.png, On the Docket-2.png
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import StatusBadge from "../shared/StatusBadge";
import TableToolbar from "../shared/TableToolbar";
import TablePagination from "../shared/TablePagination";
import AddEventModal from "./AddEventModal";
import EditEventModal from "./EditEventModal";
import { useAdminEvents } from "@/hooks/useAdmin";
import type { AdminEventListItem } from "@/services/admin.services";
import { formatDate, formatNaira } from "../shared/format";

// Matches AdminEventStatus from services/admin.services.ts
const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
  { label: "Past", value: "past" },
];

// status pill labels per the API notes: pending_review→Pending, published→Approved, rejected→Rejected
function statusLabel(status: string) {
  switch (status) {
    case "pending_review":
      return "Pending";
    case "published":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "pending_payment":
      return "Pending Payment";
    case "draft":
      return "Draft";
    case "past":
      return "Past";
    default:
      return status;
  }
}

export default function DocketPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEventListItem | null>(null);

  const { data, isLoading } = useAdminEvents({
    page,
    limit: 8,
    q: search,
    status,
  });

  const items = data?.items ?? [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="On The Docket" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Events" value={(stats?.totalEvents ?? 0).toLocaleString()} />
          <StatCard label="Pending Events" value={(stats?.pendingEvents ?? 0).toLocaleString()} />
          <StatCard label="Approved Events" value={(stats?.approvedEvents ?? 0).toLocaleString()} />
          <StatCard
            label="Revenue Generated"
            value={formatNaira(((stats?.revenueGeneratedKobo ?? 0) as number) / 100)}
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
              label: "All Status",
              value: status,
              options: STATUS_OPTIONS,
              onChange: (v) => {
                setStatus(v);
                setPage(1);
              },
            },
          ]}
          rightAction={
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors"
            >
              <Plus size={15} />
              Add Event
            </button>
          }
        />

        <div className="border border-[#E5E7EB] rounded-xl overflow-x-auto">
          <table className="w-full text-left min-w-225">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {[
                  "Title",
                  "Firm / Organizer",
                  "Contact",
                  "Start Date",
                  "End Date",
                  "Status",
                  "Payment",
                  "Action",
                ].map((h) => (
                  <th key={h} className="text-[12px] font-semibold text-gray-600 px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Loading events...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400 text-[13px]">
                    No events found.
                  </td>
                </tr>
              ) : (
                items.map((ev) => {
                  const sr = ev.serviceRequest;
                  const title = ev.title ?? "Untitled";
                  const organizer = sr?.account?.fullName ?? sr?.contactName ?? "—";
                  const contact = sr?.contactEmail ?? "—";
                  const amount = sr?.amount != null ? `₦${(sr.amount / 100).toLocaleString()}` : "—";

                  // Actions for promotion events route through serviceRequest.id,
                  // since /admin/docket/:id (detail/approve/reject) is keyed by
                  // that id, not event.id. Plain editorial events (no
                  // serviceRequest) get a direct Edit action via PATCH /events/:id.
                  const canAct = !!sr?.id;
                  const isPending = ev.status === "pending_review";

                  return (
                    <tr key={ev.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="px-5 py-3.5 text-[13px] text-gray-800 whitespace-nowrap">{title}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{organizer}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{contact}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                        {ev.startAt ? formatDate(ev.startAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                        {ev.endAt ? formatDate(ev.endAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={statusLabel(ev.status)} />
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{amount}</td>
                      <td className="px-5 py-3.5">
                        {canAct ? (
                          <button
                            onClick={() => router.push(`/admin/docket/${sr!.id}`)}
                            className={`px-4 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                              isPending
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {isPending ? "Take Action" : "View Details"}
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingEvent(ev)}
                            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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

      {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} />}
      {editingEvent && (
        <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} />
      )}
    </div>
  );
}