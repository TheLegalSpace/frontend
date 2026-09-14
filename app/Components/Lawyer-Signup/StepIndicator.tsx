// components/lawyer-signup/StepIndicator.tsx
"use client";

import { Check } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    title: "How will you use TheLegalSpace?",
    description: "Set up as an individual lawyer or law firm.",
  },
  {
    title: "Tell us about yourself",
    description: "Share your details for clients to see your expertise.",
  },
  {
    title: "Verify your identity",
    description: "Submit your details for review to activate your account",
  },
];

export default function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <div className="w-full border-b border-[#E5E7EB] bg-white">
      {/* Desktop — horizontal */}
      <div className="hidden md:block px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-start">
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <div key={index} className="flex items-start flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    {index > 0 && (
                      <div
                        className={`flex-1 h-0.5 ${isCompleted ? "bg-[#1A56DB]" : "bg-gray-200"}`}
                      />
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                        isCompleted
                          ? "bg-[#1A56DB] border-[#1A56DB]"
                          : isActive
                            ? "bg-white border-[#1A56DB]"
                            : "bg-white border-gray-200"
                      }`}
                    >
                      {isCompleted ? (
                        <Check
                          className="w-3.5 h-3.5 text-white"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-[#1A56DB]" : "bg-gray-300"}`}
                        />
                      )}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 ${currentStep > stepNum ? "bg-[#1A56DB]" : "bg-gray-200"}`}
                      />
                    )}
                  </div>
                  <div className="mt-2 text-center px-1">
                    <p
                      className={`text-[12px] font-medium leading-tight ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile — vertical list */}
      <div className="md:hidden px-4 py-4">
        <div className="flex flex-col gap-0">
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            const isLast = index === STEPS.length - 1;

            return (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                      isCompleted
                        ? "bg-[#1A56DB] border-[#1A56DB]"
                        : isActive
                          ? "bg-white border-[#1A56DB]"
                          : "bg-white border-gray-200"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                    ) : (
                      <div
                        className={`w-2 h-2 rounded-full ${isActive ? "bg-[#1A56DB]" : "bg-gray-300"}`}
                      />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 min-h-5 mt-1 ${isCompleted ? "bg-[#1A56DB]" : "bg-gray-200"}`}
                    />
                  )}
                </div>
                {/* Right — text */}
                <div className={`pb-3 ${isLast ? "" : "pb-3"}`}>
                  <p
                    className={`text-[12px] font-medium leading-tight ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
