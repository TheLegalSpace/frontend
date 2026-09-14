// app/forgot-password/ForgotPasswordClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { authService } from "@/services/auth.services";
import { parseApiError } from "@/lib/error";

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      // Always navigate forward — even if email doesn't exist, backend may
      // return 200 to prevent user enumeration. Show the verify screen.
      router.push(
        `/verify-reset-code?email=${encodeURIComponent(email)}`
      );
    } catch (err: unknown) {
      const { message } = parseApiError(err);
      setError(message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            href="/signin"
            className="inline-flex items-center gap-1.5 text-[12px] text-white/40 hover:text-white/70 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>

          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#1A56DB]/20 border border-[#1A56DB]/30 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#1A56DB]" />
            </div>
            <h1 className="font-[Instrument_Serif] text-[26px] text-white font-normal mb-1.5">
              Forgot password?
            </h1>
            <p className="text-[13px] text-white/50 leading-relaxed">
              Enter the email address linked to your account and we&apos;ll send
              you a reset code.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-white/60">Email Address</label>
              <input
                id="forgot-password-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-400 -mt-2">{error}</p>
            )}

            <button
              id="forgot-password-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending code...
                </>
              ) : (
                "Send reset code"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
