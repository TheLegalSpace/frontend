// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  Menu,
  X,
  Users,
  FileText,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type UserRole = "USER" | "LAWYER" | "FIRM" | "ADMIN";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// ✅ Nav items per role
const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  USER: [
    { label: "Feeds",         href: "/dashboard/feeds",         icon: LayoutGrid },
    { label: "Messages",      href: "/dashboard/messages",      icon: MessageCircle },
    { label: "Requests",      href: "/dashboard/requests",      icon: Briefcase },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
  ],
  LAWYER: [
    { label: "Feeds",         href: "/dashboard/feeds",         icon: LayoutGrid },
    { label: "Leads",         href: "/dashboard/leads",         icon: Users },
    { label: "Messages",      href: "/dashboard/messages",      icon: MessageCircle },
    { label: "Posts",         href: "/dashboard/posts",         icon: FileText },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
  ],
  FIRM: [
    { label: "Feeds",         href: "/dashboard/feeds",         icon: LayoutGrid },
    { label: "Leads",         href: "/dashboard/leads",         icon: Users },
    { label: "Messages",      href: "/dashboard/messages",      icon: MessageCircle },
    { label: "Posts",         href: "/dashboard/posts",         icon: FileText },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
  ],
  ADMIN: [
    { label: "Feeds",         href: "/dashboard/feeds",         icon: LayoutGrid },
    { label: "Messages",      href: "/dashboard/messages",      icon: MessageCircle },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Settings",      href: "/dashboard/settings",      icon: Settings },
  ],
};

// ✅ Footer CTA per role
const FOOTER_CTA: Record<UserRole, { label: string; href: string; icon: React.ElementType } | null> = {
  USER:   { label: "Get a lawyer", href: "/dashboard/find-lawyer", icon: Scale },
  LAWYER: null, // lawyers don't need "Get a lawyer"
  FIRM:   null,
  ADMIN:  null,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role: UserRole = (user?.role as UserRole) ?? "USER";
  const navItems = NAV_ITEMS[role] ?? NAV_ITEMS.USER;
  const footerCta = FOOTER_CTA[role];

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <aside className="w-[220px] h-screen fixed top-0 left-0 border-r border-gray-100 flex flex-col bg-white">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white text-xs">
            ⚖
          </div>
          <span className="text-sm font-medium text-gray-900">
            The Legal Space
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile card */}
      <div className="px-5 py-4 border-b border-gray-100">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 mb-2.5 overflow-hidden">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <p className="text-[13px] font-medium text-gray-900">{user?.fullName}</p>

        {/* Role badge */}
        <div className="flex items-center gap-1.5 mt-0.5 mb-1.5">
          <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border mb-2.5 ${
            role === "LAWYER"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : role === "FIRM"
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : role === "ADMIN"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {role === "LAWYER" && <Scale className="w-2.5 h-2.5" />}
          {role === "FIRM" && <Building2 className="w-2.5 h-2.5" />}
          {role.charAt(0) + role.slice(1).toLowerCase()}
        </span>

        {/* Stats */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">
              {role === "USER" ? "Reviews" : "Rating"}
            </span>
            <span className="font-medium text-gray-900 flex items-center gap-0.5">
              {Array.from(
                { length: Math.round(parseFloat(user?.avgRating ?? "0")) },
                (_, i) => (
                  <Star key={`filled-${i}`} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ),
              )}
              {Array.from(
                { length: 5 - Math.round(parseFloat(user?.avgRating ?? "0")) },
                (_, i) => (
                  <Star key={`empty-${i}`} className="w-3 h-3 text-gray-200" />
                ),
              )}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Connections</span>
            <span className="font-medium text-gray-900">
              {user?.connectionCount ?? 0}
            </span>
          </div>
          {/* Lawyer-specific stats */}
          {(role === "LAWYER" || role === "FIRM") && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Reviews</span>
              <span className="font-medium text-gray-900">
                {user?.reviewCount ?? 0}
              </span>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/profile"
          className="w-full py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
        >
          Visit Profile <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] mb-0.5 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-blue-600" : "text-gray-400"
                }`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 flex flex-col gap-2">
        {/* CTA — only for USER role */}
        {footerCta && (
          <Link
            href={footerCta.href}
            className="w-full py-2 border-[1.5px] border-gray-900 rounded-lg text-[13px] font-medium text-gray-900 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <footerCta.icon className="w-4 h-4" />
            {footerCta.label}
          </Link>
        )}

        <button
          onClick={logout}
          className="w-full py-2 bg-red-50 border border-red-100 rounded-lg text-[13px] font-medium text-red-500 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-lg shadow-sm"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <div className="w-[220px] min-h-screen sticky top-0">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="md:hidden fixed top-0 left-0 h-full z-50 shadow-xl">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}