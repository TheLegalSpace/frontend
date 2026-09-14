// app/Components/Admin/shared/AdminPageHeader.tsx
"use client";

import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  action?: ReactNode;
  backHref?: string;
}

export default function AdminPageHeader({ title, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
      <h1 className="font-[Instrument_Serif] text-[22px] leading-none font-light text-[#1F2937]">
        {title}
      </h1>
      {action}
    </div>
  );
}
