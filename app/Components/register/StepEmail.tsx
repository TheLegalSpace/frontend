// app/Components/register/StepEmail.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  onNext: (payload: {
    email: string;
    password: string;
    role: "USER" | "PENDING_PROFESSIONAL";
  }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function StepEmail({
  onNext,
  isLoading = false,
  error = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  const displayError = localError || error;

  const validate = () => {
    if (!email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields.");
      return false;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return false;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setLocalError("Password must contain at least one special character.");
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (role: "PENDING_PROFESSIONAL") => {
    setLocalError("");
    if (!validate()) return;
    await onNext({ email, password, role });
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/sign-in-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000000d3",
        backgroundBlendMode: "darken",
      }}
    >
      {/* Logo */}
      <div className="px-8 py-6">
        <img src="/tls-logo-white.png" alt="The Legal Space" className="h-9 w-auto" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-transparent backdrop-blur-sm border border-white/30 rounded-2xl px-8 py-8">
          <h1 className="text-[22px] font-light text-white mb-1 text-center font-[Instrument_Serif]">
            Join TheLegalSpace as a Legal Professional
          </h1>
          <p className="text-[12px] leading-[24px] text-[#FFFFFFCC] mb-6 text-center">
            Create your verified profile and start getting discovered by people
            actively seeking legal help across Nigeria.
          </p>

          {displayError && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/20 border border-red-400/30 rounded-xl">
              <p className="text-[12px] text-red-300">{displayError}</p>
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[12px] text-white/60 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              className="w-full px-3 py-3 bg-[#2a2a2a] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-60 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-[12px] text-white/60 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="w-full px-3 py-3 pr-10 bg-[#2a2a2a] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4 text-white" />
                ) : (
                  <Eye className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Password hints */}
          <div className="mb-4 flex flex-col gap-0.5 px-1">
            <p
              className={`text-[11px] flex items-center gap-1.5 transition-colors ${
                password.length >= 8 ? "text-green-400" : "text-white/30"
              }`}
            >
              <span className="text-[10px]">
                {password.length >= 8 ? "✓" : "•"}
              </span>
              Must be at least 8 characters
            </p>
            <p
              className={`text-[11px] flex items-center gap-1.5 transition-colors ${
                /[^a-zA-Z0-9]/.test(password)
                  ? "text-green-400"
                  : "text-white/30"
              }`}
            >
              <span className="text-[10px]">
                {/[^a-zA-Z0-9]/.test(password) ? "✓" : "•"}
              </span>
              Must contain one special character
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-[12px] text-white/60 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit("PENDING_PROFESSIONAL");
                }}
                className="w-full px-3 py-3 pr-10 bg-[#2a2a2a7c] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4 text-white" />
                ) : (
                  <Eye className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* ✅ Two separate CTAs */}
          <button
            onClick={() => handleSubmit("PENDING_PROFESSIONAL")}
            disabled={isLoading}
            className="w-full py-3 bg-[#1A56DB] text-white text-[14px] font-medium rounded-xl hover:bg-[#1648b8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Please wait..." : "Create Account"}
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-white/30">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* ✅ Google */}
          <button
            disabled={isLoading}
            className="w-full py-3 bg-[#2a2a2a] border border-white/10 text-white text-[14px] font-medium rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-5"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <p className="text-center text-[12px] text-white/40">
            Have an account?{" "}
            <a
              href="/signin"
              className="text-[#1A56DB] hover:underline font-medium"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
