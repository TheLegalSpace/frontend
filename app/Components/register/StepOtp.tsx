// app/Components/register/StepOtp.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  initialError?: string;
}

const OTP_LENGTH = 8;
const RESEND_COOLDOWN = 30;

export default function StepOtp({ email, onVerify, onResend, initialError = "" }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [error, setError] = useState(initialError); // ✅ seed with initialError
  // ... rest stays same
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const next = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < OTP_LENGTH) next[index + i] = pasted[i];
      }
      setDigits(next);
      const focusIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerify();
  };

  const handleVerify = async () => {
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setIsVerifying(true);
    try {
      await onVerify(otp);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid code. Please try again.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
  if (countdown > 0 || isResending) return;
  setIsResending(true);
  setError("");
  try {
    await onResend();
    setCountdown(RESEND_COOLDOWN);
    setDigits(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? "";

    // ✅ Rate limit — show longer cooldown message
    if (
      msg.toLowerCase().includes("rate limit") ||
      msg.toLowerCase().includes("too many") ||
      err?.response?.status === 429
    ) {
      setError("Too many attempts. Please wait a few minutes before requesting a new code.");
      setCountdown(120); // ✅ Force 2 min cooldown on rate limit
    } else {
      setError(msg || "Failed to resend code. Please try again.");
    }
  } finally {
    setIsResending(false);
  }
};

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/signinbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000000d3",
        backgroundBlendMode: "darken",
      }}
    >
      {/* Logo */}
      <div className="px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center text-white text-xs">
            ⚖
          </div>
          <span className="text-sm font-medium text-white/90">The Legal Space</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-8 text-center">
          <h1 className="text-[22px] font-light text-white mb-2">
            Verify your email
          </h1>
          <p className="text-[13px] text-white/60 mb-1">
            We've sent a 6-digit code to your email.
          </p>
          <p className="text-[13px] text-white/80 font-medium mb-6 truncate px-2">
            {email}
          </p>

          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/20 border border-red-400/30 rounded-xl">
              <p className="text-[12px] text-red-300">{error}</p>
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-11 h-12 text-center text-[18px] font-semibold rounded-xl text-white outline-none transition-all border ${
                  digit
                    ? "bg-white/20 border-white/60"
                    : "bg-white/10 border-white/20 focus:border-white/50"
                }`}
              />
            ))}
          </div>

          {/* Verify */}
          <button
            onClick={handleVerify}
            disabled={isVerifying || digits.join("").length < OTP_LENGTH}
            className="w-full py-3 bg-[#1A56DB] text-white text-[14px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-5"
          >
            {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
            {isVerifying ? "Verifying..." : "Verify & Continue"}
          </button>

          {/* Resend row */}
          <div className="flex items-center gap-2 text-[12px] text-white/40 mb-3">
            <div className="h-px flex-1 bg-white/10" />
            <span>
              Didn't receive the code? Resend in{" "}
              <span className="text-[#1A56DB] font-medium">
                {formatTime(countdown)}
              </span>
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="w-full py-2.5 border border-white/10 rounded-xl text-[13px] text-white/40 hover:text-white/60 hover:border-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isResending ? "Resending..." : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}