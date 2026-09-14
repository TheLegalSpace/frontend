// app/Components/Admin/shared/TablePagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function TablePagination({
  page,
  totalPages,
  onChange,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = (() => {
    const visible = new Set<number>([1, totalPages, page]);
    if (page > 1) visible.add(page - 1);
    if (page < totalPages) visible.add(page + 1);
    return Array.from(visible)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  })();

  return (
    <div className="flex items-center justify-center gap-1.5 py-5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && (
              <span className="text-gray-300 text-[13px] px-1">…</span>
            )}
            <button
              onClick={() => onChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] transition-colors ${
                p === page
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
