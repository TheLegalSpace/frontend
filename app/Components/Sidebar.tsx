// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MessageCircle,
  Briefcase,
  Bell,
  Settings,
  Scale,
  LogOut,
  ArrowRight,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "Feeds", href: "/dashboard/feeds", icon: LayoutGrid },
  { label: "Messages", href: "/dashboard/messages", icon: MessageCircle },
  { label: "Requests", href: "/dashboard/requests", icon: Briefcase },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials =
    user?.fullName
      ?.split(" ")
      .map((name: any) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <aside className="w-[220px] min-h-screen border-r border-gray-100 flex flex-col bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white text-xs">
          ⚖
        </div>
        <span className="text-sm font-medium text-gray-900">
          The Legal Space
        </span>
      </div>

      {/* Profile card */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 mb-2.5">
          {initials}
        </div>
        <p className="text-[13px] font-medium text-gray-900">
          {user?.fullName}
        </p>
        <p className="text-[11px] text-gray-400 truncate mb-2.5">
          {user?.email}
        </p>

        <div className="flex flex-col gap-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Reviews</span>
            <span className="font-medium text-gray-900 flex items-center gap-1">
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.round(parseFloat(user?.avgRating ?? "0")) },
                  (_, i) => (
                    <Star
                      key={`filled-${i}`}
                      className="w-3 h-3 text-amber-400 fill-amber-400"
                    />
                  ),
                )}
                {Array.from(
                  {
                    length: 5 - Math.round(parseFloat(user?.avgRating ?? "0")),
                  },
                  (_, i) => (
                    <Star
                      key={`empty-${i}`}
                      className="w-3 h-3 text-gray-200"
                    />
                  ),
                )}
              </div>
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Connections</span>
            <span className="font-medium text-gray-900">
              {user?.connectionCount}
            </span>
          </div>
        </div>

        <Link
          href="/dashboard/profile"
          className="w-full py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          Visit Profile <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5 transition-colors ${
              pathname.startsWith(href)
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon className="w-[17px] h-[17px] flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 flex flex-col gap-2">
        <Link
          href="/find-lawyer"
          className="w-full py-2 border-[1.5px] border-gray-900 rounded-lg text-[13px] font-medium text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Scale className="w-4 h-4" />
          Get a lawyer
        </Link>
        <button
          onClick={logout}
          className="w-full py-2 border border-gray-100 rounded-lg text-[13px] text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
