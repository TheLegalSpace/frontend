// components/settings/SettingsPage.tsx
"use client";

import { useMe } from "@/hooks/useProfile";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";

import { Loader2 } from "lucide-react";
import PersonalInfoSection from "./PersonalInfoSection";
import PracticeAreasSection from "./PracticeAreasSection";
import ServicesPricingSection from "./ServicesPricingSection";
import NotificationsSection from "./NotificationsSection";
import DeleteAccountSection from "./DeleteAccountSection";
import { useAuth } from "@/app/context/AuthContext";
import { USER_ROLES } from "@/app/types/types";
import AnonymousSection from "./AnonymousSection";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMe();
  const { data: allPracticeAreas = [] } = usePracticeAreas();

  const isLawyer = user?.role === USER_ROLES.LAWYER;
  const isFirm = user?.role === USER_ROLES.FIRM;
  const isLawyerOrFirm = isLawyer || isFirm;

  const isUser = user?.role === USER_ROLES.USER;
  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const account = profile.data;

  const practiceAreas = account.practiceAreas ?? [];
  const practiceAreaNames: string[] = practiceAreas.map(
    (a: string | { name: string; id: string }) =>
      typeof a === "string" ? a : a.name,
  );
  const practiceAreaIds: string[] = practiceAreas.map(
    (a: string | { name: string; id: string }) =>
      typeof a === "string"
        ? (allPracticeAreas.find((p) => p.name === a)?.id ?? "")
        : a.id,
  );

  // ✅ Build services per practice area for lawyers/firms
  const servicesAreas = isLawyerOrFirm
    ? practiceAreaIds.map((id, i) => ({
        id,
        name: practiceAreaNames[i] ?? "",
      }))
    : [];

  // Split full name
  const nameParts = (account.fullName ?? "").split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pt-3">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-100 px-6 divide-y divide-gray-100 py-3">
        {/* Personal Information — all roles */}
        <PersonalInfoSection
          fullName={account.fullName ?? ""} // ✅ pass as fullName
          email={account.email ?? ""}
          phone={account.phone ?? ""}
          role={account.role ?? "USER"}
        />
        {isUser && (
          <AnonymousSection isAnonymous={account.isAnonymous ?? false} />
        )}
        {/* Practice Areas — lawyers & firms only */}
        {isLawyerOrFirm && (
          <PracticeAreasSection
            practiceAreas={allPracticeAreas}
            currentAreaNames={practiceAreaNames}
            currentIds={practiceAreaIds}
            primaryId={practiceAreaIds[0] ?? ""}
            secondaryId={practiceAreaIds[1] ?? ""}
            role={account.role ?? "LAWYER"}
          />
        )}

        {/* Services & Pricing — lawyers & firms only */}
        {isLawyerOrFirm && <ServicesPricingSection practiceAreas={servicesAreas} />}

        {/* Notifications — lawyers & firms only */}
        {isLawyerOrFirm && <NotificationsSection />}

        {/* Delete Account — all roles */}
        <DeleteAccountSection />
      </div>
    </div>
  );
}
