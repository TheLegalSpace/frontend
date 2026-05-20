"use client";

import { useAuth } from "@/app/context/AuthContext";
import PostsPage from "@/app/Components/Posts/PostsPage";

export default function Page() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return null;

  return <PostsPage />;
}