// components/lawyer-signup/AccountTypeBadge.tsx
export default function AccountTypeBadge({ type }: { type: "firm" | "lawyer" }) {
  return (
    <div className="flex justify-center mb-4">
      <span className="text-[12px] px-3 py-1 bg-blue-50 text-[#1A56DB] border border-blue-100 rounded-full font-medium">
        {type === "firm" ? "Law Firm" : "Independent Lawyer"}
      </span>
    </div>
  );
}