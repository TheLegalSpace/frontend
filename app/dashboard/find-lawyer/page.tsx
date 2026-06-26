"use client";
import FindALawyer from "@/app/Components/FindALawyer";
import { useAuth } from "@/app/context/AuthContext";
import { UserRole } from "@/app/types/types";
import Link from "next/link";

import React from "react";

const page = () => {
  const { user } = useAuth();
  const role: UserRole = (user?.role as UserRole) ?? "USER";

  return role === "USER" ? (
    <FindALawyer />
  ) : (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-[360px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-10 text-center">
        {/* 404 */}
        <p className="text-[72px] font-light text-white/20 leading-none mb-2">
          404
        </p>

        <h1 className="text-[22px] font-light text-white mb-2 leading-tight">
          Page not found
        </h1>
        <p className="text-[13px] text-white/50 leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard/feeds"
            className="w-full py-3 bg-white rounded-full text-[13px] font-medium text-gray-900 hover:bg-gray-100 active:scale-[0.98] transition-all"
          >
            Go to Feeds
          </Link>
          <Link
            href="/signin"
            className="w-full py-3 bg-white/10 border border-white/20 rounded-full text-[13px] font-medium text-white/80 hover:bg-white/20 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default page;
