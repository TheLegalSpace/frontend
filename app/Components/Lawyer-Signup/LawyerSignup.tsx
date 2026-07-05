// app/Components/Lawyer-Signup/LawyerSignup.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Menu, X } from "lucide-react";
import Step1AccountType from "./Step1AccountType";
import Step2LawyerInfo from "./Step2LawyerInfo";
import Step2FirmInfo from "./Step2FirmInfo";
import Step3Verification from "./Step3Verification";
import { registerService } from "@/services/auth.register.services";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/context/AuthContext";
import Image from "next/image";

import signupIllustration from "@/public/registerillustration.png";

export type AccountType = "lawyer" | "firm";

const MAIN_STEPS = [
  {
    id: 1,
    title: "How will you use TheLegalSpace?",
    subtitle: "Set up as an individual lawyer or law firm.",
  },
  {
    id: 2,
    title: "Tell us about yourself",
    subtitle: "Share your details for clients to see your expertise.",
  },
  {
    id: 3,
    title: "Verify your identity",
    subtitle: "Submit your details for review to activate your account",
  },
];

export default function LawyerSignup() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();

  const [mainStep, setMainStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [subStep, setSubStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAccountTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setMainStep(2);
    setSubStep(1);
  };

  const handleSubStepComplete = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    if (subStep < 3) {
      setSubStep(subStep + 1);
    } else {
      setMainStep(3);
    }
  };

  const handleFinishSetup = async (file: File) => {
    if (!formData || !accountType) return;
    setIsLoading(true);

    try {
      const services: {
        practiceAreaId: string;
        name: string;
        price: number;
      }[] = [];
      Object.entries(formData.areaServices ?? {}).forEach(
        ([areaId, rows]: any) => {
          (rows as { service: string; pricing: string }[]).forEach((row) => {
            if (row.service.trim()) {
              services.push({
                practiceAreaId: areaId,
                name: row.service.trim(),
                price: Math.round(
                  parseFloat(row.pricing.replace(/,/g, "") || "0") * 100,
                ),
              });
            }
          });
        },
      );

      if (accountType === "lawyer") {
        await registerService.lawyerSetup({
          firstName: formData.firstName,
          lastName: formData.lastName,
          whatsappNumber: `+234${formData.phone}`,
          callToBarYear: parseInt(formData.callToBarYear),
          locationCity: formData.locationCity,
          locationCountry: "Nigeria",
          practiceAreaIds: formData.practiceAreaIds ?? [],
          services,
        });
        await registerService.uploadDocument(file, "call_to_bar_cert");
      } else {
        await registerService.firmSetup({
          firmName: formData.firmName,
          whatsappNumber: `+234${formData.phone}`,
          officeAddress: formData.officeAddress,
          firmEstablishmentYear: parseInt(formData.firmEstablishmentYear),
          locationCity: formData.locationCity,
          locationCountry: "Nigeria",
          practiceAreaIds: formData.practiceAreaIds ?? [],
          services,
        });
        await registerService.uploadDocument(file, "cac_cert");
      }

      showSuccess("Account setup complete!");
      setMainStep(4);
    } catch (err: any) {
      showError(
        err?.response?.data?.message ?? "Setup failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < mainStep) return "complete";
    if (stepId === mainStep) return "active";
    return "pending";
  };
  const handleBack = () => {
    if (mainStep === 3) {
      // Back from verification → last sub-step of step 2
      setMainStep(2);
      setSubStep(3);
      return;
    }
    if (mainStep === 2) {
      if (subStep > 1) {
        // Back within sub-steps
        setSubStep(subStep - 1);
      } else {
        // Back from sub-step 1 → step 1 (account type)
        setMainStep(1);
        setAccountType(null);
      }
      return;
    }
    // mainStep === 1 — nowhere to go back to
  };

  const canGoBack = mainStep > 1;
  // ✅ Mobile menu — vertical steps list shown in drawer
  const mobileStepsList = (
    <div className="flex flex-col gap-1 pt-2">
      {MAIN_STEPS.map((s) => {
        const status = getStepStatus(s.id);
        return (
          <div
            key={s.id}
            className="flex gap-3 py-3 border-b border-[#E5E7EB] last:border-0"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                status === "complete"
                  ? "bg-[#1A56DB] text-white"
                  : status === "active"
                    ? "border-2 border-[#1A56DB] bg-white"
                    : "border-2 border-gray-200 bg-white"
              }`}
            >
              {status === "complete" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : status === "active" ? (
                <div className="w-2 h-2 rounded-full bg-[#1A56DB]" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-200" />
              )}
            </div>
            <div>
              <p
                className={`text-[13px] font-medium ${
                  status === "pending" ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {s.title}
              </p>
              <p
                className={`text-[12px] mt-0.5 ${
                  status === "pending" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {s.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── Success screen ────────────────────────────────────────────────────────
  if (mainStep === 4) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <img src="/tls-logo-dark.png" alt="TLS" className="h-6" />
        </div>

        {/* All steps complete */}
        <div className="flex items-center justify-center py-6 border-b border-[#E5E7EB] px-4">
          {MAIN_STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center px-4 md:px-8">
                <div className="w-7 h-7 rounded-full bg-[#1A56DB] flex items-center justify-center mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-[11px] md:text-[12px] font-medium text-gray-900 text-center max-w-[100px] md:max-w-[120px]">
                  {s.title}
                </p>
                <p className="hidden md:block text-[11px] text-gray-400 text-center max-w-[140px]">
                  {s.subtitle}
                </p>
              </div>
              {i < MAIN_STEPS.length - 1 && (
                <div className="w-8 md:w-20 h-0.5 bg-[#1A56DB] shrink-0" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-sm border border-[#E5E7EB] rounded-2xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h2 className="text-[20px] font-semibold text-gray-900 mb-2">
              You're all set
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
              Your verification is complete. You can now start using your
              account.
            </p>
            <button
              onClick={() => router.replace("/dashboard/feeds")}
              className="w-full py-3 bg-[#1A56DB] text-white text-[14px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="">
      {/* Header */}
      {/* <div className="border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           {canGoBack && (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-4 text-black" />
            </button>
          )}
         </div>

         <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-gray-400 hover:text-gray-600"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div> */}

      {/* ✅ Mobile drawer — steps only, no sidebar on desktop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-white z-40 px-6 py-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <img src="/tls-logo-dark.png" alt="TLS" className="h-6" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {mobileStepsList}
          </div>
        </>
      )}

      {/* <div className="flex items-center justify-center py-5 border-b border-[#E5E7EB] px-4">
        {MAIN_STEPS.map((s, i) => {
          const status = getStepStatus(s.id);
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center px-3 md:px-8">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                    status === "complete"
                      ? "bg-[#1A56DB]"
                      : status === "active"
                        ? "border-2 border-[#1A56DB] bg-white"
                        : "border-2 border-gray-200 bg-white"
                  }`}
                >
                  {status === "complete" ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : status === "active" ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1A56DB]" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  )}
                </div>
                 <p
                  className={`hidden md:block text-[12px] font-medium text-center max-w-[130px] ${
                    status === "pending" ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {s.title}
                </p>
                <p
                  className={`hidden md:block text-[11px] text-center max-w-[150px] mt-0.5 ${
                    status === "pending" ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {s.subtitle}
                </p>
              </div>
              {i < MAIN_STEPS.length - 1 && (
                <div
                  className={`w-8 md:w-16 h-0.5 shrink-0 transition-colors ${
                    status === "complete" ? "bg-[#1A56DB]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div> */}
      <main className="flex-1 w-full flex items-center">
        <div className="w-full h-[100vh]">
          <div className="w-full h-full mx-auto ">
            {/* ✅ Main content — full width, no sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0 items-center h-full">
              <div className="hidden lg:block h-full">
                <Image
                  src={signupIllustration}
                  alt="The Legal Space community illustration"
                  className="w-full h-full  object-cover"
                  priority
                />
              </div>
              <div className="flex-1 flex flex-col items-center px-4 py-8 lg:px-14 overflow-y-auto">
                <div className="flex justify-between w-full my-4">
                  {canGoBack && (
                    <button
                      onClick={handleBack}
                      className=" rounded-lg hover:bg-gray-100 transition-colors"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="w-6 h-4 text-black" />
                    </button>
                  )}
                  {/* Account type badge */}
                  {accountType && mainStep > 1 && (
                    <div className="">
                      <span className="px-3 py-1.5 bg-[#F9FAFB] border border-[#D1D5DB] text-[#060B13] text-[12px] font-medium rounded-full shadow-[0_1px_1px_0_rgba(102,109,128,0.2)]">
                        {accountType === "lawyer"
                          ? "Lawyer"
                          : "Law Firm"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Step 1 */}
                {mainStep === 1 && (
                  <Step1AccountType
                    onNext={handleAccountTypeSelect}
                    canGoBack={canGoBack}
                  />
                )}

                {/* Step 2 — lawyer */}
                {mainStep === 2 && accountType === "lawyer" && (
                  <Step2LawyerInfo
                    subStep={subStep}
                    email={user?.email ?? "text@esr.mk"}
                    onNext={handleSubStepComplete}
                    canGoBack={canGoBack}
                  />
                )}

                {/* Step 2 — firm */}
                {mainStep === 2 && accountType === "firm" && (
                  <Step2FirmInfo
                    subStep={subStep}
                    email={user?.email ?? ""}
                    onNext={handleSubStepComplete}
                  />
                )}

                {/* Step 3 */}
                {mainStep === 3 && accountType && (
                  <Step3Verification
                    accountType={accountType}
                    onFinish={handleFinishSetup}
                    isLoading={isLoading}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
