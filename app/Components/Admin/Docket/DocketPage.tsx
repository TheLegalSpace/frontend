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
import { useDocketEvents, useDocketStats } from "@/hooks/useAdmin";
import { formatDate, formatNaira } from "../shared/format";

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "New", value: "new" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Completed", value: "completed" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
];

export default function DocketPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: stats } = useDocketStats();
  const { data, isLoading } = useDocketEvents({ page, limit: 8, search, status });

  const items = data?.items ?? [];
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
                  const title = ev.payload?.title ?? ev.event?.title ?? ev.eventName ?? "Untitled";
                  const organizer = ev.account?.fullName ?? ev.firmName ?? "Unknown";
                  const contact = ev.contactEmail ?? ev.account?.email ?? "—";
                  const startAt = ev.payload?.startAt ?? ev.startDate ?? ev.event?.startAt;
                  const endAt = ev.payload?.endAt ?? ev.endDate ?? ev.event?.endAt;
                  const amount = ev.amount != null ? `₦${(ev.amount / 100).toLocaleString()}` : "—";

                  return (
                    <tr key={ev.id} className="border-b border-[#F3F4F6] last:border-0">
                      <td className="px-5 py-3.5 text-[13px] text-gray-800 whitespace-nowrap">{title}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{organizer}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{contact}</td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                        {startAt ? formatDate(startAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                        {endAt ? formatDate(endAt) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={ev.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">{amount}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => router.push(`/admin/docket/${ev.id}`)}
                          className={`px-4 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                            ev.status === "new" || ev.status === "pending"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {ev.status === "new" || ev.status === "pending" ? "Take Action" : "View Details"}
                        </button>
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
    </div>
  );
}
