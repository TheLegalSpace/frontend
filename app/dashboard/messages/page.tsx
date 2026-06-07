"use client";

import { useAuth } from "@/app/context/AuthContext";
import MessagesPage from "@/app/Components/Messages/MessagesPage";

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  return <MessagesPage />;
}