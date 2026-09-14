// app/Components/Admin/TLSServices/AdminTLSServicesPage.tsx
// Figma source: TLS Services.png, TLS Services-1.png
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import StatCard from "../shared/StatCard";
import StatusBadge from "../shared/StatusBadge";
import TableToolbar from "../shared/TableToolbar";
import TablePagination from "../shared/TablePagination";
import EnquiryDetailModal from "./EnquiryDetailModal";
import { useServiceRequests, useTlsServiceStats } from "@/hooks/useAdmin";
import { formatDate } from "../shared/format";

const SERVICE_OPTIONS = [
  { label: "Legal Website", value: "website" },
  { label: "Appointment System", value: "appointment" },
  { label: "Productivity Tools", value: "productivity" },
  { label: "Event Promotion", value: "event_promotion" },
];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "New", value: "new" },
  { label: "Lead in Progress", value: "in_progress" },
  { label: "Lead Lost", value: "lead_lost" },
  { label: "Closed", value: "closed" },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

export default function AdminTLSServicesPage() {
  const [search, setSearch] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: stats } = useTlsServiceStats();
  const { data, isLoading } = useServiceRequests({
    page,
    limit: 8,
    type: serviceType || undefined,
    status: status || undefined,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="TLS Services" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Enquiries" value={(stats?.totalEnquiries ?? 0).toLocaleString()} />
          <StatCard label="New Enquiries" value={(stats?.newEnquiries ?? 0).toLocaleString()} />
          <StatCard label="In Progress" value={(stats?.inProgress ?? 0).toLocaleString()} />
          <StatCard label="Closed" value={(stats?.closed ?? 0).toLocaleString()} />
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
              value: serviceType,
              options: SERVICE_OPTIONS,
              onChange: (v) => {
                setServiceType(v);
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
                {["Name", "Email", "Requested Service", "Date Submitted", "Status", "Action"].map(
                  (h) => (
                    <th key={h} className="text-[12px] font-semibold text-gray-600 px-5 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <Loader2 size={16} className="animate-spin inline mr-2" />
                    Loading enquiries...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 text-[13px]">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const name = item.contactName ?? item.account?.fullName ?? "-";
                  const email = item.contactEmail ?? "-";
                  const serviceLabel = SERVICE_OPTIONS.find((s) => s.value === item.type)?.label ?? item.type;
                  const dateSubmitted = item.createdAt;

                  return (
                    <tr key={item.id} className="border-b border-[#F3F4F6] last:border-0">
                    <td className="px-5 py-3.5 text-[13px] text-gray-800 whitespace-nowrap">{name}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500 whitespace-nowrap">{email}</td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                      {serviceLabel}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-700 whitespace-nowrap">
                      {formatDate(dateSubmitted)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedId(item.id)}
                        className="px-4 py-1.5 border border-gray-300 rounded-lg text-[12.5px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View
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

      {selectedId && (
        <EnquiryDetailModal enquiryId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
