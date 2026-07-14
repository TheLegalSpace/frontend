// app/verify-reset-code/VerifyResetCodeClient.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { authService } from "@/services/auth.services";
import { parseApiError } from "@/lib/error";

const CODE_LENGTH = 8;

export default function VerifyResetCodeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleDigitChange = (index: number, value: string) => {
    // Allow only single digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");

    // Advance focus
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (digit && index === CODE_LENGTH - 1) {
      const full = [...next].join("");
      if (full.length === CODE_LENGTH) {
        submitCode(full);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();

    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted);
    }
  };

  const submitCode = useCallback(
    async (code: string) => {
      if (!email) {
        setError("Email is missing. Please start from the forgot password page.");
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const res = await authService.verifyResetCode(email, code);
        const accessToken = res.data.data.session.accessToken;
        // Navigate to reset password with the token
        router.push(
          `/reset-password?token=${encodeURIComponent(accessToken)}`
        );
      } catch (err: unknown) {
        const { message } = parseApiError(err);
        setError(message || "Invalid or expired code. Please try again.");
        // Clear digits on error
        setDigits(Array(CODE_LENGTH).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } finally {
        setIsLoading(false);
      }
    },
    [email, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    submitCode(code);
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setIsResending(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setResendCooldown(60);
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      const { message } = parseApiError(err);
      setError(message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(b.length) + c)
    : "";

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/signinbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000000cc",
        backgroundBlendMode: "darken",
      }}
    >
      {/* Logo */}
      <div className="px-6 pt-5">
        <div className="flex items-center gap-2">
          <img src="/tls-logo-white.png" alt="TLS" className="h-9" />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-100 bg-[#111111]/50 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-14">
          {/* Back link */}
          <Link
            href={`/forgot-password`}
            className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1A56DB]/20 border border-[#1A56DB]/30 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6 text-[#1A56DB]" />
            </div>
            <h1 className="font-[Instrument_Serif] text-[26px] text-white font-normal mb-1.5">
              Verify your email
            </h1>
            <p className="text-[13px] text-white/50 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="text-white/80 font-medium">{maskedEmail}</span>.
              Enter it below to continue.
            </p>
          </div>

          {/* OTP inputs */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex justify-center gap-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-digit-${i}`}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className={`w-12 h-14 text-center text-[20px] font-semibold rounded-xl border transition-all outline-none
                    bg-[#1a1a1a] text-white
                    ${digit ? "border-[#1A56DB]/60" : "border-white/10"}
                    focus:border-[#1A56DB] focus:bg-[#1a1a2e]
                    disabled:opacity-50`}
                />
              ))}
            </div>

            {error && (
              <p className="text-[12px] text-red-400 text-center -mt-2">
                {error}
              </p>
            )}

            <button
              id="verify-code-submit"
              type="submit"
              disabled={isLoading || digits.join("").length < CODE_LENGTH}
              className="w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </button>
          </form>

          {/* Resend */}
          <p className="text-center text-[13px] text-white/40 mt-6">
            Didn&apos;t receive a code?{" "}
            <button
              id="resend-code-btn"
              type="button"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="text-[#1A56DB] hover:underline font-medium disabled:opacity-50 disabled:no-underline"
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
