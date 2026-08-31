// app/reset-password/ResetPasswordClient.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth.services";
import { parseApiError } from "@/lib/error";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-500", "bg-yellow-500", "bg-green-500"];
  const labels = ["Weak", "Fair", "Strong"];

  if (!password) return null;

  return (
    <div className="flex flex-col gap-2 mt-1">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-1.5">
              <CheckCircle2
                className={`w-3 h-3 transition-colors ${
                  c.pass ? "text-green-400" : "text-white/20"
                }`}
              />
              <span
                className={`text-[11px] transition-colors ${
                  c.pass ? "text-white/60" : "text-white/25"
                }`}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
        {score > 0 && (
          <span
            className={`text-[11px] font-semibold ${
              score === 1
                ? "text-red-400"
                : score === 2
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // ✅ Client-side: password === confirmPassword
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!accessToken) {
      setError("Session expired. Please restart the password reset flow.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(accessToken, newPassword);
      setSuccess(true);
      // Auto-redirect to sign in after 2.5s
      setTimeout(() => router.replace("/signin"), 2500);
    } catch (err: unknown) {
      const { message } = parseApiError(err);
      setError(message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
        <div className="px-6 pt-5">
          <img src="/tls-logo-white.png" alt="TLS" className="h-9" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-100 bg-[#111111]/50 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            </div>
            <h1 className="font-[Instrument_Serif] text-[26px] text-white font-normal mb-2">
              Password reset!
            </h1>
            <p className="text-[13px] text-white/50 leading-relaxed mb-6">
              Your password has been updated successfully. You&apos;ll be
              redirected to sign in shortly.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors"
            >
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Back */}
          <Link
            href="/verify-reset-code"
            className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1A56DB]/20 border border-[#1A56DB]/30 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-[#1A56DB]" />
            </div>
            <h1 className="font-[Instrument_Serif] text-[26px] text-white font-normal mb-1.5">
              Create new password
            </h1>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Choose a strong password for your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-white/60">New Password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-11 bg-[#1a1a1a] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showNew ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-white/60">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-11 bg-[#1a1a1a] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showConfirm ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword && (
                <p
                  className={`text-[11px] mt-0.5 ${
                    newPassword === confirmPassword
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {newPassword === confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            {error && (
              <p className="text-[12px] text-red-400 -mt-2">{error}</p>
            )}

            <button
              id="reset-password-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
