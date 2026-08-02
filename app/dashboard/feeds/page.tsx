"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Feed from "../../Components/Feed/Feed";
import EventsPanel from "@/app/Components/EventPanel";
import LawyerProfileView from "@/app/Components/LawyerProfileView";
import { useAuth } from "../../context/AuthContext";
import { type FeedTab } from "@/hooks/useFeed";

const TABS: FeedTab[] = ["All", "Top Firms", "Top Lawyers", "Articles"];

export default function FeedPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<FeedTab>("All");

  const selectedAccountId = searchParams.get("accountId");

  if (isLoading) return null;
  if (!user) return null;

  if (selectedAccountId) {
    return (
      <main className="bg-white">
        <LawyerProfileView
          accountId={selectedAccountId}
          onBack={() => router.push("/dashboard/feeds")}
          backLabel="Feeds"
        />
      </main>
    );
  }

  return (
    <main className="bg-white">
      {/* Tabs */}
      <div className="fixed bg-white w-full ">
        <div className="flex gap-2 px-4 pt-4 pb-3  bg-white w-full h-18.5">
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.9fr_1.1fr] items-start">
        <Feed activeTab={activeTab} />
        {/* Right */}
        <div className="min-w-0">
          <EventsPanel />
        </div>
      </div>
    </main>
  );
}
