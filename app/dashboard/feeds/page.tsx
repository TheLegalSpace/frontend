"use client";

import { useState, useEffect } from "react";
import Feed from "../../Components/Feed/Feed";
import EventsPanel from "@/app/Components/EventPanel";
import { useAuth } from "../../context/AuthContext";

export default function FeedPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 grid grid-cols-1 xl:grid-cols-[1.7fr_0.72fr] gap-5 items-start">
      <Feed />
      {/* Right */}
      <div className="min-w-0">
        <EventsPanel />
      </div>
    </main>
  );
}