"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Frown,
  ChevronDown,
  Send,
  CheckCircle2,
  ShieldAlert,
  LogIn,
} from "lucide-react";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../../services/api";

/**
 * SupportTicketForm
 * ------------------
 * "Submit a support ticket" section for The Legal Space.
 *
 * - **Logged in**  → form with pre-filled & locked name/email fields.
 * - **Logged out** → placeholder CTA asking the user to sign in first.
 */

const SUPPORT_IMAGE_SRC = "/contact-illustration_img.png";

/**
 * Backend enum: "billing" | "technical" | "account" | "general"
 * Display labels are user-friendly; the value matches what the backend expects.
 */
const CATEGORY_OPTIONS = [
  { value: "billing", label: "Account & billing" },
  { value: "technical", label: "Technical issue" },
  { value: "account", label: "Account support" },
  { value: "general", label: "General inquiry" },
] as const;

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  category: string;
  subject: string;
  body: string;
};

function splitName(fullName?: string | null) {
  if (!fullName) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  return { firstName: firstName ?? "", lastName: rest.join(" ") };
}

/* ========================================================================
 *  UnauthenticatedPlaceholder
 *  Shown when there is no logged-in user — redirects to sign-in.
 * ======================================================================== */
function UnauthenticatedPlaceholder() {
  return (
    <section className="w-full bg-white">
      <div className="grid w-full grid-cols-1 lg:grid-cols-2">
        {/* Image panel — navbar overlaid on top */}
        <div className="relative h-90 w-full sm:h-[520px] lg:h-auto lg:min-h-[900px]">
          <div className="absolute inset-x-0 top-0 z-10 px-4 pt-4 sm:px-6 sm:pt-6">
            <Navbar strongBlur />
          </div>
          <Image
            src={SUPPORT_IMAGE_SRC}
            alt="A Legal Space support specialist ready to help"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* CTA panel */}
        <div className="flex items-center justify-center bg-white px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20 xl:px-24">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F0]">
              <ShieldAlert className="h-8 w-8 text-[#8A887E]" />
            </div>

            <h1 className="text-[28px] font-bold leading-tight text-[#14140F] sm:text-[34px] lg:text-[38px]">
              Sign in to contact support
            </h1>

            <p className="mt-3 text-[15px] leading-relaxed text-[#8A887E]">
              You need to be signed in to submit a support ticket. Once you sign
              in, we'll pre-fill your name and email so you can jump straight to
              describing your issue.
            </p>

            <Link
              href="/signin?redirect=%2Fsupport"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2547D0] px-8 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#1E3AB0] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2547D0]/25"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>

            <p className="mt-5 text-[14px] text-[#8A887E]">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[#2547D0] underline underline-offset-2 hover:text-[#1E3AB0]"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer visible />
    </section>
  );
}

/* ========================================================================
 *  AuthenticatedForm
 *  Full support-ticket form with name & email pre-filled and locked.
 * ======================================================================== */
function AuthenticatedForm({
  user,
}: {
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const [form, setForm] = useState<FormState>(() => ({
    ...splitName(user?.fullName),
    email: user?.email ?? "",
    category: "",
    subject: "",
    body: "",
  }));
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  // Name and email are always locked — we're behind the auth guard.
  const locked = true;

  const update =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.category ||
      !form.subject ||
      !form.body
    ) {
      setError("Fill in every field so we know how to help.");
      return;
    }

    setStatus("submitting");
    try {
      const payload = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        email: form.email.trim(),
        category: form.category,
        subject: form.subject.trim(),
        body: form.body.trim(),
      };

      await api.post("/support/tickets", payload);
      setStatus("sent");
      setForm({
        ...splitName(user?.fullName),
        email: user?.email ?? "",
        category: "",
        subject: "",
        body: "",
      });
    } catch (err: unknown) {
      setStatus("idle");
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong on our end. Try again in a moment.";
      setError(message);
    }
  };

  return (
    <div className="flex items-center bg-white px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20 xl:px-24 font-dmSans">
      <div className="w-full max-w-xl">
        <h1 className="text-[28px] font-bold leading-tight text-[#14140F] sm:text-[30px] lg:text-[38px] font-dmSans">
          Submit a support ticket
        </h1>
        <p className="mt-2 text-[15px] text-[#8A887E]">
          We'll get back to you as soon as possible.
        </p>

        {/* Submitting-as notice */}
        {/* <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E3E1D9] bg-[#FAFAF8] px-4 py-2.5 text-[13px] text-[#5C5A50]">
          <User className="h-3.5 w-3.5 shrink-0 text-[#8A887E]" />
          <span>
             <strong className="font-semibold text-[#14140F]">
              {form.firstName} {form.lastName}
            </strong>{" "}
            ({form.email})
          </span>
        </div> */}

        {status === "sent" ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#D8E3D3] bg-[#F2F7EF] px-5 py-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3E7A3E]" />
            <div>
              <p className="text-[15px] font-medium text-[#14140F]">
                Ticket sent
              </p>
              <p className="mt-0.5 text-[14px] text-[#5C5A50]">
                Check your inbox for a confirmation. Most tickets get a reply
                within one business day.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="ml-auto shrink-0 text-[13px] font-medium text-[#2547D0] underline-offset-2 hover:underline"
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* First / last name */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                icon={<User className="h-4.5 w-4.5" />}
                placeholder="First name"
                value={form.firstName}
                onChange={update("firstName")}
                name="firstName"
                autoComplete="given-name"
                readOnly={locked}
                locked={locked}
              />
              <Field
                icon={<User className="h-4.5 w-4.5" />}
                placeholder="Last name"
                value={form.lastName}
                onChange={update("lastName")}
                name="lastName"
                autoComplete="family-name"
                readOnly={locked}
                locked={locked}
              />
            </div>

            {/* Email */}
            <Field
              icon={<Mail className="h-4.5 w-4.5" />}
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={update("email")}
              name="email"
              autoComplete="email"
              readOnly={locked}
              locked={locked}
            />

            {/* Category */}
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A887E]">
                <Frown className="h-4.5 w-4.5" />
              </span>
              <select
                value={form.category}
                onChange={update("category")}
                name="category"
                className="peer w-full appearance-none rounded-xl border border-[#E3E1D9] bg-white py-3.5 pl-11 pr-10 text-[15px] text-[#14140F] outline-none transition-colors focus:border-[#2547D0] focus:ring-4 focus:ring-[#2547D0]/10"
              >
                <option value="" disabled>
                  Select category
                </option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A887E] peer-focus:text-[#2547D0]" />
            </div>

            {/* Subject */}
            <Field
              placeholder="Subject (brief summary)"
              value={form.subject}
              onChange={update("subject")}
              name="subject"
              autoComplete="off"
            />

            {/* Body / detailed message */}
            <textarea
              value={form.body}
              onChange={update("body")}
              name="body"
              placeholder="Write your issue here"
              rows={6}
              className="w-full resize-none rounded-xl border border-[#E3E1D9] bg-white p-4 text-[15px] text-[#14140F] outline-none transition-colors placeholder:text-[#8A887E] focus:border-[#2547D0] focus:ring-4 focus:ring-[#2547D0]/10"
            />

            {error && <p className="text-[13px] text-[#B4442E]">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2547D0] py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-[#1E3AB0] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2547D0]/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "submitting" ? (
                "Sending..."
              ) : (
                <>
                  Submit ticket
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ========================================================================
 *  Field
 *  Shared input control with optional icon and lock indicator.
 * ======================================================================== */
function Field({
  icon,
  locked,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  locked?: boolean;
}) {
  return (
    <div className="relative focus-within:[&_svg]:text-[#2547D0]">
      {icon && (
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A887E]">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border border-[#E3E1D9] bg-white py-3.5 ${
          icon ? "pl-11" : "pl-4"
        } pr-10 text-[15px] text-[#14140F] outline-none transition-colors placeholder:text-[#8A887E] read-only:bg-[#FAFAF8] read-only:text-[#5C5A50] focus:border-[#2547D0] focus:ring-4 focus:ring-[#2547D0]/10`}
      />
      {locked && (
        <Lock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A887E]" />
      )}
    </div>
  );
}

/* ========================================================================
 *  Page root
 * ======================================================================== */
export default function SupportTicketForm() {
  const { user } = useAuth();

  // ── Not logged in → placeholder CTA ──────────────────────────────────
  if (!user) {
    return <UnauthenticatedPlaceholder />;
  }

  // ── Logged in → pre-filled form ──────────────────────────────────────
  return (
    <section className="w-full bg-white">
      <div className="grid w-full grid-cols-1 lg:grid-cols-2">
        {/* Image panel — navbar overlaid on top */}
        <div className="relative h-90 w-full sm:h-[520px] lg:h-auto lg:min-h-[900px]">
          <div className="absolute inset-x-0 top-0 z-10 px-4 pt-4 sm:px-6 sm:pt-6">
            <Navbar strongBlur />
          </div>
          <Image
            src={SUPPORT_IMAGE_SRC}
            alt="A Legal Space support specialist ready to help"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* Form panel */}
        <AuthenticatedForm user={user} />
      </div>
      <Footer visible />
    </section>
  );
}
