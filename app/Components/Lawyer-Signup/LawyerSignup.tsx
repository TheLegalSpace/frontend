// components/lawyer-signup/LawyerSignup.tsx
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import StepIndicator from "./StepIndicator";
import Step1AccountType, { AccountType } from "./Step1AccountType";
import Step2LawyerInfo, { LawyerFormData } from "./Step2LawyerInfo";
import Step2FirmInfo, { FirmFormData } from "./Step2FirmInfo";
import Step3Verification from "./Step3Verification";
import StepSuccess from "./StepSuccess";
import { lawyerAuthService } from "@/services/auth.lawyer.services";

export default function LawyerSignup() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<LawyerFormData | FirmFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Track sub-step from outside so LawyerSignup controls global back
  const [lawyerSubStep, setLawyerSubStep] = useState(1);
  const [firmSubStep, setFirmSubStep] = useState(1);

  const currentSubStep = accountType === "lawyer" ? lawyerSubStep : firmSubStep;
  const setCurrentSubStep = accountType === "lawyer" ? setLawyerSubStep : setFirmSubStep;

  const handleStep1 = (type: AccountType) => {
    setAccountType(type);
    setStep(2);
  };

  const handleStep2 = (data: LawyerFormData | FirmFormData) => {
    setFormData(data);
    setStep(3);
  };

  const handleStep3 = async () => {
    if (!formData || !accountType) return;
    setIsLoading(true);
    setError("");

    try {
      if (accountType === "lawyer") {
        const d = formData as LawyerFormData;
        await lawyerAuthService.registerLawyer({
          authProvider: "email",
          fullName: `${d.firstName} ${d.lastName}`,
          email: d.email,
          password: "",
          scn: d.scn || "",
          callToBarYear: parseInt(d.callToBarYear),
          nbaBranch: d.nbaBranch || "",
          practiceAreaIds: d.practiceAreaIds,
          feeRangeMin: parseInt(d.feeRangeMin || "0"),
          feeRangeMax: parseInt(d.feeRangeMax || "0"),
          locationCity: d.locationCity,
          locationCountry: "Nigeria",
        });
      } else {
        const d = formData as FirmFormData;
        await lawyerAuthService.registerFirm({
          authProvider: "email",
          firmName: d.firmName,
          email: d.email,
          password: "",
          rcNumber: d.rcNumber,
          firmEstablishmentYear: parseInt(d.firmEstablishmentYear),
          verifyingPartnerScn: d.verifyingPartnerScn,
          practiceAreaIds: d.practiceAreaIds,
          feeRangeMin: parseInt(d.feeRangeMin || "0"),
          feeRangeMax: parseInt(d.feeRangeMax || "0"),
          locationCity: d.locationCity,
        });
      }
      setStep(4);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Global back handler — knows exactly where to go
  const handleBack = () => {
    setError("");

    if (step === 4) return; // success — no back

    if (step === 3) {
      // Back from verification → last sub-step of step 2
      setStep(2);
      setCurrentSubStep(3);
      return;
    }

    if (step === 2) {
      if (currentSubStep > 1) {
        // Back within sub-steps
        setCurrentSubStep(currentSubStep - 1);
      } else {
        // Back from sub-step 1 → step 1 (account type)
        setStep(1);
        setLawyerSubStep(1);
        setFirmSubStep(1);
      }
      return;
    }

    // step 1 — nowhere to go back to
  };

  const canGoBack = step > 1 && step < 4;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3">
        {/* ✅ Back arrow in header */}
        {canGoBack && (
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white text-xs">
            ⚖
          </div>
          <span className="text-sm font-medium text-gray-900">The Legal Space</span>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-1.5">
          <div className="flex flex-col gap-1">
            <div className="w-4 h-0.5 bg-gray-600" />
            <div className="w-4 h-0.5 bg-gray-600" />
            <div className="w-4 h-0.5 bg-gray-600" />
          </div>
        </button>
      </div>

      {step < 4 && <StepIndicator currentStep={step} />}

      {error && (
        <div className="px-4 pt-4 max-w-sm mx-auto w-full">
          <div className="px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-[12px] text-red-500">{error}</p>
          </div>
        </div>
      )}

      {step === 1 && <Step1AccountType onNext={handleStep1} />}

      {step === 2 && accountType === "lawyer" && (
        <Step2LawyerInfo
          onNext={handleStep2}
          subStep={lawyerSubStep}
          onSubStepChange={setLawyerSubStep}
        />
      )}

      {step === 2 && accountType === "firm" && (
        <Step2FirmInfo
          onNext={handleStep2}
          subStep={firmSubStep}
          onSubStepChange={setFirmSubStep}
        />
      )}

      {step === 3 && accountType && (
        <Step3Verification
          accountType={accountType}
          onNext={handleStep3}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}

      {step === 4 && <StepSuccess />}
    </div>
  );
}   