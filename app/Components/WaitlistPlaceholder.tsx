// app/Components/WaitlistPlaceholder.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, User } from "lucide-react";

export type WaitlistVariant = "lawyer" | "user";

const COPY: Record<
  WaitlistVariant,
  { heading: string; subheading: string; success: string; social: string }
> = {
  lawyer: {
    heading: "Join the lawyer waitlist",
    subheading:
      "TLS launches soon. Join now and we'll email you the moment verified lawyer registration opens.",
    success: "We'll shoot you an email when TLS is open for lawyers!",
    social: "Over 2,000 lawyers are already on board!",
  },
  user: {
    heading: "Join the user waitlist",
    subheading:
      "TLS launches soon. Join now and we'll email you the moment user registration opens.",
    success: "We'll shoot you an email when TLS is open for clients!",
    social: "Over 2,000 users are already on board!",
  },
};

/**
 * Reusable waitlist form shown while the redesigned landing page is in flight.
 *
 * It reads the audience preference from `localStorage` key `loginType`
 * ("lawyer" | "user") and renders the matching waitlist form + captcha. Drop
 * it into any page — StepEmail, SignInClient, etc. — and it adapts to the
 * logged-in/preferred audience automatically.
 */
export default function WaitlistPlaceholder() {
  const [variant, setVariant] = useState<WaitlistVariant>("lawyer");

  // Pick the form content from the stored audience preference.
  useEffect(() => {
    const stored = localStorage.getItem("loginType");
    if (stored === "lawyer" || stored === "user") {
      setVariant(stored);
    }
  }, []);

  const copy = COPY[variant];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [notARobot, setNotARobot] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    if (!notARobot) {
      setError("Please confirm you're not a robot.");
      return;
    }
    setLoading(true);
    try {
      // Persist the signup server-side (frontend /api/waitlist route) into the
      // waitlist spreadsheet, then show the success state.
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, variant }),
      });
      const data = await res.json().catch(() => null);
      // The API returns HTTP 200 with a `duplicate: true` flag when this email
      // is already on the list, so surface it as an error instead of success.
      if (data?.duplicate) {
        throw new Error(data.message ?? "You're already on the waitlist.");
      }
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to join the waitlist.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full flex flex-col justify-center py-8 lg:py-0 max-w-160 mx-auto mt-30 lg:pr-10 lg:mt-0 lg:mx-0">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3 leading-tight">
          Thanks, {fullName.split(" ")[0] || "there"} 😊.
        </h1>
        <p className="text-[15px] text-gray-500 mb-8 leading-relaxed">
          {copy.success}
        </p>
        <Link
          href="/"
          className="w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors flex items-center justify-center"
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center py-8 lg:py-0 max-w-160 mx-auto mt-30 lg:px-10 lg:mt-0 lg:mx-0">
      <span className="inline-block w-fit mb-6 px-3 py-1.5 bg-blue-50 text-[#1A56DB] text-[12px] font-medium rounded-full">
        THE LEGAL SPACE IS LAUNCHING SOON!!! 🎉
      </span>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3 leading-tight">
        {copy.heading}
      </h1>
      <p className="text-[15px] text-gray-500 mb-8 leading-relaxed">
        {copy.subheading}
      </p>

      {error && (
        <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-[12px] text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {/* Full name */}
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          <input
            type="name"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={loading}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["/avatar1.png", "/avatar2.png", "/avatar3.png"].map((src, i) => (
              <Image
                key={i}
                src={src}
                alt=""
                width={28}
                height={28}
                className="w-7 h-7 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
          <p className="text-[13px] text-gray-500">{copy.social}</p>
        </div>

        {/* Not a robot (placeholder — swap for real reCAPTCHA) */}
        <label className="flex items-center justify-between gap-3 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer select-none">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={notARobot}
              onChange={(e) => setNotARobot(e.target.checked)}
              disabled={loading}
              className="w-5 h-5 rounded border-gray-300 accent-[#1A56DB]"
            />
            <span className="text-[14px] text-gray-700">I'm not a robot</span>
          </span>
          <span className="text-[10px] text-gray-400 text-right leading-tight">
            reCAPTCHA
            <br />
            Privacy · Terms
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Please wait..." : "Join waitlist"}
        </button>
      </form>
    </div>
  );
}
