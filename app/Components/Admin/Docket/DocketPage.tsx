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
  { label: "Approved", value: "Approved" },
  { label: "Pending", value: "Pending" },
  { label: "Rejected", value: "Rejected" },
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
          <StatCard label="Revenue Generated" value={formatNaira(stats?.revenueGenerated ?? 0)} />
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
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E5E7EB]">
                {[
                  "Event Name",
                  "Organizer",
                  "Flyer",
                  "Additional Info",
                  "Start Date",
                  "End Date",
                  "Status",
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
                items.map((ev) => (
                  <tr key={ev.id} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="px-5 py-3.5 text-[13px] text-gray-800 whitespace-nowrap">{ev.eventName}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{ev.organizerEmail}</td>
                    <td className="px-5 py-3.5">
                      <a
                        href={ev.flyerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap inline-block"
                      >
                        View Flyer
                      </a>
                    </td>
                    <td className="px-5 py-3.5">
                      {ev.additionalInfoUrl ? (
                        <a
                          href={ev.additionalInfoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap inline-block"
                        >
                          View link
                        </a>
                      ) : (
                        <span className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-400 whitespace-nowrap inline-block">
                          No link
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                      {formatDate(ev.startDate)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                      {formatDate(ev.endDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => router.push(`/admin/docket/${ev.id}`)}
                        className={`px-4 py-1.5 rounded-lg text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                          ev.status === "Pending"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {ev.status === "Pending" ? "Take Action" : "Event Details"}
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

      {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
