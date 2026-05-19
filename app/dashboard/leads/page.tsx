"use client";

import { useAuth } from "@/app/context/AuthContext";
import LeadsPage from "@/app/Components/Leads/Leadspage";

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  return <LeadsPage />;
}