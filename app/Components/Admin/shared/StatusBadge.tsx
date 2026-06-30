// app/Components/Admin/shared/StatusBadge.tsx
"use client";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-50 text-green-700",
  Approved: "bg-green-50 text-green-700",
  Closed: "bg-green-50 text-green-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Pending: "bg-amber-50 text-amber-700",
  "In Progress": "bg-amber-50 text-amber-700",
  New: "bg-blue-50 text-blue-700",
  Open: "bg-red-50 text-red-600",
  Suspended: "bg-red-50 text-red-600",
  Rejected: "bg-red-50 text-red-600",
  Failed: "bg-red-50 text-red-600",
  "Lead Lost": "bg-red-50 text-red-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  const dotColor = style.includes("green")
    ? "bg-green-500"
    : style.includes("amber")
      ? "bg-amber-500"
      : style.includes("red")
        ? "bg-red-500"
        : style.includes("blue")
          ? "bg-blue-500"
          : "bg-gray-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}
