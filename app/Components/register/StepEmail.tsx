// app/Components/register/StepEmail.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, Lock } from "lucide-react";
import Link from "next/link";
import Footer from "../Footer";
import Navbar from "../Navbar";
import Image from "next/image";

import signupIllustration from "@/public/signupillustration.png";

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
    <div className="min-h-screen w-full flex flex-col bg-white text-black">
      <Navbar />
      {/* Logo */}
      <main className="flex-1 w-full flex items-center">
        <div className="w-full h-[90vh]">
          <div className="w-full  mx-auto s">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="hidden lg:block">
                <Image
                  src={signupIllustration}
                  alt="The Legal Space community illustration"
                  className="w-full h-auto  object-cover"
                  priority
                />
              </div>
              <div className="w-full px-4 lg:mx-0 text-left">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3 leading-tight font-dmSans">
                  Welcome Back
                </h1>
                <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed font-dmSans">
                  Sign in to access your profile, opportunities, research tools,
                  and everything The Legal Space has to offer.
                </p>
                {displayError && (
                  <div className="mb-4 px-3 py-2.5 bg-red-500/20 border border-red-400/30 rounded-xl">
                    <p className="text-[12px] text-red-300">{displayError}</p>
                  </div>
                )}
                <div className="w-full flex flex-col gap-4">
                  {/* Header */}
                  {/* <div className="text-center mb-8">
                    <h1 className="text-[26px] font-light text-white mb-2 font-[Instrument_Serif]">
                      Join TheLegalSpaces
                    </h1>
                    <p className="text-[13px] text-white/50 leading-relaxed">
                      Create your verified profile and start getting discovered
                      by people actively seeking legal help across Nigeria.
                    </p>
                  </div> */}

                  {displayError && (
                    <div className="mb-4 px-3 py-2.5 bg-red-500/20 border border-red-400/30 rounded-xl">
                      <p className="text-[12px] text-red-300">{displayError}</p>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-gray-600">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] text-gray-600">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type={showPw ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPw ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password hints */}
                  <div className="my-4 flex flex-col gap-0.5 px-1">
                    <p
                      className={`text-[11px] flex items-center gap-1.5 transition-colors ${
                        password.length >= 8
                          ? "text-green-400"
                          : "text-black/30"
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
                          : "text-black/30"
                      }`}
                    >
                      <span className="text-[10px] text-black/30">
                        {/[^a-zA-Z0-9]/.test(password) ? "✓" : "•"}
                      </span>
                      Must contain one special character
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-6">
                    <label className="text-[13px] text-gray-600">
                      Confirm Password
                    </label>
                    <div className="relative">
                      {" "}
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSubmit("PENDING_PROFESSIONAL");
                        }}
                        className="w-full pl-11 pr-11 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirm ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() => handleSubmit("PENDING_PROFESSIONAL")}
                    disabled={isLoading}
                    className="w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Please wait..." : "Create Account"}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-black/10" />
                    <span className="text-[12px] text-black/30">or</span>
                    <div className="flex-1 h-px bg-black/10" />
                  </div>

                  {/* Already have an account */}
                  <div className="text-center">
                    <p className="text-[13px] text-black/40">
                      Already have an account?{" "}
                      <Link
                        href="/signin"
                        className="text-[#1A56DB] hover:text-[#1648b8] transition-colors font-medium"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer visible={false} />
    </div>
  );
}
