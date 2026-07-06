// app/Components/Lawyer-Signup/LawyerSignup.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { registerService } from "@/services/auth.register.services";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/context/AuthContext";
import signupIllustration from "@/public/registerillustration.png";

import Step1AccountType from "./Step1AccountType";
import StepMembership from "./StepMembership";
import StepPersonalInfo from "./StepPersonalInfo";
import StepPracticeAreas from "./StepPracticeAreas";
import StepProfessionalFees, {
  type AreaFeeEntry,
} from "./StepProfessionalFees";
import StepVerification from "./StepVerification";
import { profileService } from "@/services/profile.services";
import { membershipService } from "@/services/membership.services";

export type AccountType = "lawyer" | "firm";

// ─── Step identifiers ────────────────────────────────────────────────────────
type Step =
  | "account_type" // 1 — Lawyer / Law Firm
  | "membership" // 2 — Professional (pay) / Community (free)
  | "personal_info" // 3 — Tell Us About Yourself
  | "practice_areas" // 4 — Professional Information
  | "fees" // 5 — Professional Fees
  | "verification" // 6 — Verify Professional Status (lawyers only)
  | "success"; // 7 — Registration Complete

// Step order for Back navigation (firms skip verification; locked users can't
// reach account_type/membership once they've paid for Professional)
function prevStep(
  step: Step,
  accountType: AccountType | null,
  locked: boolean,
): Step | null {
  const allSteps: Step[] = [
    "account_type",
    "membership",
    "personal_info",
    "practice_areas",
    "fees",
    "verification",
    "success",
  ];
  const lawyerFlow = allSteps;
  const firmFlow = allSteps.filter((s) => s !== "verification");
  let flow = accountType === "firm" ? firmFlow : lawyerFlow;
  if (locked) {
    flow = flow.filter((s) => s !== "account_type" && s !== "membership");
  }
  const idx = flow.indexOf(step);
  return idx > 0 ? flow[idx - 1] : null;
}

export default function LawyerSignup() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState<Step>("account_type");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [locked, setLocked] = useState(false); // true once Professional payment is confirmed
  const [resuming, setResuming] = useState(true); // true while we check for a half-finished user

  // Detect a returning half-finished user (per Plan Selection & Payment Flow doc)
  useEffect(() => {
    (async () => {
      try {
        const account = await refreshUser();
        if (!account) {
          setResuming(false);
          return;
        }

        if (account.role === "LAWYER" || account.role === "FIRM") {
          const type: AccountType =
            account.role === "FIRM" ? "firm" : "lawyer";
          setAccountType(type);

          const hasProfile =
            type === "lawyer"
              ? !!account.lawyerProfile
              : !!account.firmProfile;

          if (hasProfile) {
            router.replace("/dashboard/feeds"); // fully onboarded, shouldn't be here
            return;
          }

          const membership = await membershipService.getMembership();
          if (membership.data?.tier === "professional") {
            setLocked(true);
            setStep("personal_info"); // already paid — skip account_type + membership
          } else {
            setStep("membership"); // type already picked, still on Community
          }
        }
        // role === "PENDING_PROFESSIONAL" → leave step at default "account_type"
      } catch {
        // no session / request failed — fall back to the start of the wizard
      } finally {
        setResuming(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const merge = (data: Record<string, unknown>) =>
    setFormData((prev) => ({ ...prev, ...data }));

  // ─── Account type selection ──────────────────────────────────────────────
  // NEW — calls PATCH /profile/me/professional-role immediately on selection,
  // before the plans screen ever shows. Re-callable/idempotent per the API,
  // so no need to guard against repeat calls if the user switches type.
  const handleAccountType = async (type: AccountType) => {
    setIsLoading(true);
    try {
      await profileService.setProfessionalRole(
        type === "firm" ? "FIRM" : "LAWYER",
      );
      setAccountType(type);
      setStep("membership");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Couldn't save your selection. Please try again.";
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Back ────────────────────────────────────────────────────────────────
  const handleBack = () => {
    const prev = prevStep(step, accountType, locked);
    if (prev) setStep(prev);
  };
  // Derives visibility from prevStep itself, so a locked user resumed on
  // personal_info (whose filtered flow starts there) correctly gets no button.
  const canGoBack = step !== "success" && prevStep(step, accountType, locked) !== null;

  // ─── Submit (last step, lawyers — with cert upload) ─────────────────────
  const handleFinish = async (file: File) => {
    if (!accountType) return;
    setIsLoading(true);

    const practiceAreas = (formData.fees as AreaFeeEntry[] | undefined) ?? [];

    try {
      if (accountType === "lawyer") {
        await registerService.lawyerSetup({
          firstName: String(formData.firstName ?? ""),
          lastName: String(formData.lastName ?? ""),
          whatsappNumber: `+234${formData.phone}`,
          callToBarYear: parseInt(String(formData.callToBarYear), 10),
          locationCity: String(formData.locationCity ?? ""),
          locationCountry: "Nigeria",
          practiceAreas,
        });
        await registerService.uploadDocument(file, "call_to_bar_cert");
      } else {
        await registerService.firmSetup({
          firmName: String(formData.firmName ?? ""),
          whatsappNumber: `+234${formData.phone}`,
          officeAddress: String(formData.officeAddress ?? ""),
          firmEstablishmentYear: parseInt(
            String(formData.firmEstablishmentYear),
            10,
          ),
          locationCity: String(formData.locationCity ?? ""),
          locationCountry: "Nigeria",
          practiceAreas,
        });
        await registerService.uploadDocument(file, "cac_cert");
      }
      showSuccess("Registration complete!");
      setStep("success");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Setup failed. Please try again.";
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Firm submit (no verification doc) ──────────────────────────────────
  // Accepts an optional override so callers that just merged fees into state
  // can pass them directly, instead of reading back a stale `formData` closure.
  const handleFirmFinish = async (practiceAreasOverride?: AreaFeeEntry[]) => {
    if (!accountType) return;
    setIsLoading(true);
    const practiceAreas =
      practiceAreasOverride ??
      (formData.fees as AreaFeeEntry[] | undefined) ??
      [];
    try {
      await registerService.firmSetup({
        firmName: String(formData.firmName ?? ""),
        whatsappNumber: `+234${formData.phone}`,
        officeAddress: "",
        firmEstablishmentYear: parseInt(
          String(formData.firmEstablishmentYear),
          10,
        ),
        locationCity: String(formData.locationCity ?? ""),
        locationCountry: "Nigeria",
        practiceAreas,
      });
      showSuccess("Registration complete!");
      setStep("success");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Setup failed. Please try again.";
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resuming guard ──────────────────────────────────────────────────────
  if (resuming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // ─── Success screen ──────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h2 className="text-[28px] sm:text-[32px] font-semibold text-gray-900 mb-3 font-dmSans">
            Registration Complete 🎉
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed mb-6 font-dmSans">
            Your profile has been submitted successfully and is currently under
            review. We&apos;ll notify you once verification is complete and your
            account has been approved.
          </p>
          <p className="text-[14px] text-gray-500 leading-relaxed mb-8 font-dmSans">
            In the meantime, you can start exploring the community, articles,
            and opportunities available on the platform.
          </p>
          <button
            onClick={() => router.replace("/dashboard/feeds")}
            className="w-full py-3.5 bg-[#1A56DB] text-white text-[14px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors font-dmSans"
          >
            Go to Feed
          </button>
        </div>
      </div>
    );
  }

  // ─── Main layout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Illustration — left half, desktop only */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src={signupIllustration}
          alt="The Legal Space"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 shrink-0">
          {canGoBack ? (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          ) : (
            <div />
          )}
          {accountType && step !== "account_type" && (
            <span className="px-3 py-1.5 bg-[#F9FAFB] border border-[#D1D5DB] text-[#060B13] text-[12px] font-medium rounded-full shadow-sm font-dmSans">
              {accountType === "lawyer" ? "Lawyer" : "Law Firm"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-14 py-8">
          {step === "account_type" && (
            <Step1AccountType onNext={handleAccountType} />
          )}

          {step === "membership" && accountType && (
            <StepMembership
              accountType={accountType}
              onCommunity={() => setStep("personal_info")}
            />
          )}

          {step === "personal_info" && accountType && (
            <StepPersonalInfo
              accountType={accountType}
              email={user?.email ?? ""}
              onNext={(data) => {
                merge(data);
                setStep("practice_areas");
              }}
            />
          )}

          {step === "practice_areas" && accountType && (
            <StepPracticeAreas
              accountType={accountType}
              onNext={(data) => {
                merge(data);
                setStep("fees");
              }}
            />
          )}

          {step === "fees" && (
            <StepProfessionalFees
              practiceAreaIds={(formData.practiceAreaIds as string[]) ?? []}
              onNext={(fees) => {
                merge({ fees });
                if (accountType === "lawyer") {
                  setStep("verification");
                } else {
                  // Firms: no cert upload — submit directly. Pass fees straight
                  // through instead of relying on the just-merged state.
                  handleFirmFinish(fees);
                }
              }}
            />
          )}

          {step === "verification" && accountType === "lawyer" && (
            <StepVerification
              accountType={accountType}
              onFinish={handleFinish}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}