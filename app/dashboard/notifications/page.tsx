"use client";
 
import { useAuth } from "@/app/context/AuthContext";
import EventsPanel from "@/app/Components/EventPanel";
import NotificationsPage from "@/app/Components/Notifications/NotificationsPage"; 
 
export default function Page() {
  const { user, isLoading } = useAuth();
 
  if (isLoading) return null;
  if (!user) return null;
 
  return (
    <main className="min-h-screen bg-gray-50 grid grid-cols-1 xl:grid-cols-[1.7fr_0.72fr] gap-5 items-start">
      <NotificationsPage />
      <div className="min-w-0">
        <EventsPanel />
      </div>
    </main>
  );
}