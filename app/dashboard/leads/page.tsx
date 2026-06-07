"use client";

import { useAuth } from "@/app/context/AuthContext";
import LeadsPage from "@/app/Components/Leads/Leadspage";

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  return (
    <div className="w-full bg-white min-h-screen py-0">
      {/* Fixed Heading - stays at top like Profile */}
      <div className="h-18.75 flex items-center border-b border-[#E6EAED] px-4 fixed w-full bg-white z-99999 mt-0">
        <h1 className="font-[Instrument_Serif] text-[22px] font-normal text-gray-900 mt-0">
          Leads
        </h1>
      </div>

      {/* Content starts below the fixed heading */}
      <div className="mt-0">
        <LeadsPage />
      </div>
    </div>
  );
}