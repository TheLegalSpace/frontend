"use client";

import { useState, useEffect } from "react";
import Feed from "../../Components/Feed/Feed";
import { useAuth } from "../../context/AuthContext";

export default function FeedPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Feed />
    </main>
  );
}