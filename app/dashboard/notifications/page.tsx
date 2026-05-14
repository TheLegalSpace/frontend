"use client";
 
import { useAuth } from "@/app/context/AuthContext";
import NotificationsPage from "@/app/Components/Notifications/NotificationsPage"; 
 
export default function Page() {
  const { user, isLoading } = useAuth();
 
  if (isLoading) return null;
  if (!user) return null;
 
  return <NotificationsPage />;
}