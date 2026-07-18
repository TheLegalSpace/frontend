"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { User, Mail, ChevronDown, Send, CheckCircle2 } from "lucide-react";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../../services/api";

/**
 * SupportTicketForm
 * ------------------
 * "Submit a support ticket" section for The Legal Space.
 * Sits below the existing navbar and above the existing footer —
 * this component owns only the split hero-image / form region.
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
  name: string;
  email: string;
  category: string;
  subject: string;
  body: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  category: "",
  subject: "",
  body: "",
};

export default function SupportTicketForm() {
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(() => ({
    name: user?.fullName ?? "",
    email: user?.email ?? "",
    category: "",
    subject: "",
    body: "",
  }));
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

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
      !form.name ||
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
        name: form.name.trim(),
        email: form.email.trim(),
        category: form.category,
        subject: form.subject.trim(),
        body: form.body.trim(),
      };

      await api.post("/support/tickets", payload);
      setStatus("sent");
      setForm({
        name: user?.fullName ?? "",
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
    <>
      <Navbar />
      <section className="w-full bg-white">
        <div className="mx-auto grid w-full grid-cols-1 lg:grid-cols-[46%_54%]">
          {/* Image panel */}
          <div className="relative h-55 w-full sm:h-70 lg:h-auto lg:min-h-180">
            <Image
              src={SUPPORT_IMAGE_SRC}
              alt="A Legal Space support specialist ready to help"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0B0B08]/70 via-[#0B0B08]/0 to-[#0B0B08]/10" />

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 lg:bottom-14 lg:left-12 lg:right-12">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                Member support
              </span>
              <p className="mt-3 max-w-sm font-serif text-lg leading-snug text-white sm:text-xl lg:text-2xl">
                Tell us what's going on. A real person on our team reads every
                ticket.
              </p>
            </div>
          </div>

          {/* Ticket-stub divider — hidden on smallest screens, horizontal on mobile, vertical on desktop */}
          <div
            aria-hidden="true"
            className="relative h-3 w-full bg-white lg:hidden"
          >
            <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 border-t border-dashed border-[#D8D6CC]" />
            <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white ring-1 ring-[#D8D6CC]" />
            <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white ring-1 ring-[#D8D6CC]" />
          </div>

          {/* Form panel */}
          <div className="relative flex items-center px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20 xl:px-24">
            {/* vertical stub notches, desktop only */}
            <div
              aria-hidden="true"
              className="absolute -left-3 top-0 hidden h-full w-6 lg:block"
            >
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 border-l border-dashed border-[#D8D6CC]" />
              <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-white ring-1 ring-[#D8D6CC]" />
              <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-white ring-1 ring-[#D8D6CC]" />
            </div>

            <div className="w-full max-w-xl">
              <h1 className="font-serif text-[28px] leading-tight text-[#14140F] sm:text-[34px] lg:text-[38px]">
                Submit a support ticket
              </h1>
              <p className="mt-2 text-[15px] text-[#8A887E]">
                We'll get back to you as soon as possible.
              </p>

              {status === "sent" ? (
                <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#D8E3D3] bg-[#F2F7EF] px-5 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3E7A3E]" />
                  <div>
                    <p className="text-[15px] font-medium text-[#14140F]">
                      Ticket sent
                    </p>
                    <p className="mt-0.5 text-[14px] text-[#5C5A50]">
                      Check your inbox for a confirmation. Most tickets get a
                      reply within one business day.
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
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-4"
                  noValidate
                >
                  {/* Full name */}
                  <Field
                    icon={<User className="h-4.5 w-4.5" />}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={update("name")}
                    name="name"
                    autoComplete="name"
                  />

                  {/* Email */}
                  <Field
                    icon={<Mail className="h-4.5 w-4.5" />}
                    placeholder="Email address"
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    name="email"
                    autoComplete="email"
                  />

                  {/* Category */}
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={update("category")}
                      name="category"
                      className="peer w-full appearance-none rounded-xl border border-[#E3E1D9] bg-white py-3.5 pl-4 pr-10 text-[15px] text-[#14140F] outline-none transition-colors focus:border-[#2547D0] focus:ring-4 focus:ring-[#2547D0]/10"
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
                    icon={<Mail className="h-4.5 w-4.5" />}
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
                    placeholder="Describe your issue in detail"
                    rows={6}
                    className="w-full resize-none rounded-xl border border-[#E3E1D9] bg-white p-4 text-[15px] text-[#14140F] outline-none transition-colors placeholder:text-[#8A887E] focus:border-[#2547D0] focus:ring-4 focus:ring-[#2547D0]/10"
                  />

                  {error && (
                    <p className="text-[13px] text-[#B4442E]">{error}</p>
                  )}

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
        </div>
      </section>
      <Footer visible={false} />
    </>
  );
}

function Field({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative focus-within:[&_svg]:text-[#2547D0]">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A887E]">
        {icon}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-[#E3E1D9] bg-white py-3.5 pl-11 pr-4 text-[15px] text-[#14140F] outline-none transition-colors placeholder:text-[#8A887E] focus:border-[#2547D0] focus:ring-4 focus:ring-[#2547D0]/10"
      />
    </div>
  );
}
