// app/Components/Admin/shared/TableToolbar.tsx
"use client";

import { Printer, Search } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[13px] text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%239CA3AF%22><path d=%22M5.5 7.5l4.5 4.5 4.5-4.5%22 stroke=%22%239CA3AF%22 stroke-width=%221.5%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-no-repeat bg-position-[right_0.6rem_center]"
    >
      <option value="">{label}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

interface TableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  onPrint?: () => void;
  rightAction?: React.ReactNode;
}

export default function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search",
  filters = [],
  onPrint,
  rightAction,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="relative w-full sm:max-w-xs">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <FilterDropdown key={f.label} {...f} />
        ))}
        {onPrint && (
          <button
            onClick={onPrint}
            aria-label="Print"
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Printer size={15} />
          </button>
        )}
        {rightAction}
      </div>
    </div>
  );
}
