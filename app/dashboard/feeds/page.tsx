"use client";

import { useState } from "react";
import Feed from "../../Components/Feed/Feed";
import EventsPanel from "@/app/Components/EventPanel";
import { useAuth } from "../../context/AuthContext";
import { type FeedTab } from "@/hooks/useFeed";

const TABS: FeedTab[] = ["All", "Top Firms", "Top Lawyers", "Articles"];

export default function FeedPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>("All");

  if (isLoading) return null;
  if (!user) return null;

  return (
    <main className="bg-white">
      {/* Tabs */}
      <div className="fixed bg-white w-full ">
        <div className="flex gap-2 px-4 pt-4 pb-3  bg-white w-full h-[74px]">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="border-t border-[#E6EAED] " />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5 items-start px-4">
        <Feed activeTab={activeTab} />
        {/* Right */}
        <div className="min-w-0">
          <EventsPanel />
        </div>
      </div>
    </main>
  );
}
