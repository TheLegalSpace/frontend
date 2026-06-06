"use client";

import { X } from "lucide-react";

interface Props {
  lawyerName: string;
  lawyerPhone?: string | null;
  lawyerEmail?: string | null;
  onClose: () => void;
  onContinueOnTLS: () => void;
}

const TLS_ICON = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="20" rx="5" fill="#1a1a2e" />
    <path
      d="M10 3L4 6v4c0 3.31 2.56 6.41 6 7 3.44-.59 6-3.69 6-7V6l-6-3z"
      fill="#3b5bdb"
      opacity="0.9"
    />
    <path
      d="M8.5 10.5l1.5 1.5 2.5-2.5"
      stroke="white"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WHATSAPP_ICON = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="20" rx="5" fill="#25D366" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 3.5a6.5 6.5 0 0 0-5.512 9.938L3.5 16.5l3.175-1.007A6.5 6.5 0 1 0 10 3.5zm-2.97 4.02c.13-.29.26-.3.39-.305.1-.004.22-.003.33-.003.11 0 .3.04.46.215.16.174.6.585.6 1.427 0 .842-.615 1.656-.7 1.77-.084.115-1.167 1.884-2.858 2.567-.424.171-.755.274-1.013.35-.425.13-.812.111-1.118.067-.34-.05-1.05-.43-1.197-.844-.147-.415-.147-.77-.103-.844.044-.074.16-.118.335-.207z"
      fill="white"
    />
  </svg>
);

const GMAIL_ICON = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="20" rx="5" fill="white" stroke="#e5e7eb" />
    <path d="M4 6.5L10 11l6-4.5" stroke="#EA4335" strokeWidth="1.2" />
    <rect
      x="4"
      y="6"
      width="12"
      height="9"
      rx="1"
      stroke="#4285F4"
      strokeWidth="1.2"
      fill="none"
    />
    <path d="M4 6l6 5 6-5" fill="#EA4335" />
  </svg>
);

export default function EngagementModal({
  lawyerName,
  lawyerPhone,
  lawyerEmail,
  onClose,
  onContinueOnTLS,
}: Props) {
  const whatsappHref = lawyerPhone
    ? `https://wa.me/${lawyerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi ${lawyerName}, I'd like to proceed with my legal matter.`,
      )}`
    : null;

  const emailHref = lawyerEmail
    ? `mailto:${lawyerEmail}?subject=${encodeURIComponent(
        "Legal Matter — Proceeding Outside TLS",
      )}&body=${encodeURIComponent(
        `Hi ${lawyerName},\n\nI'd like to proceed with my legal matter outside The Legal Space.\n\nKind regards`,
      )}`
    : null;

  const options: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    href?: string | null;
    onClick?: () => void;
    disabled?: boolean;
  }[] = [
    {
      icon: TLS_ICON,
      title: "Continue on The Legal Space",
      subtitle: "Keep the conversation on the platform",
      onClick: onContinueOnTLS,
    },
    {
      icon: WHATSAPP_ICON,
      title: "Connect via WhatsApp",
      subtitle: lawyerPhone
        ? "Move to WhatsApp for direct communication"
        : "Phone number not available",
      href: whatsappHref,
      disabled: !lawyerPhone,
    },
    {
      icon: GMAIL_ICON,
      title: "Connect via Email",
      subtitle: lawyerEmail
        ? "Use email for official communication"
        : "Email address not available",
      href: emailHref,
      disabled: !lawyerEmail,
    },
  ];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-0 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet on mobile, centered modal on desktop */}
      <div className="relative w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl pb-safe">
        {/* Handle bar — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X size={15} className="text-gray-400" />
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <h2 className="text-[18px] font-semibold text-gray-900 font-['Instrument_Serif']">
            Proceed with Engagement
          </h2>
          <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
            We're here to help you with your legal matters.
            <br />
            What steps would you like to take next?
          </p>
        </div>

        {/* Options */}
        <div className="px-4 pb-6 flex flex-col gap-2">
          {options.map((opt) => {
            const inner = (
              <div
                className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl border transition text-left
                  ${
                    opt.disabled
                      ? "border-[#E5E7EB] bg-gray-50 opacity-50 cursor-not-allowed"
                      : "border-gray-200 bg-white hover:bg-gray-50 cursor-pointer active:scale-[0.99]"
                  }`}
              >
                <div className="shrink-0">{opt.icon}</div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 truncate">
                    {opt.title}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5 truncate">
                    {opt.subtitle}
                  </p>
                </div>
              </div>
            );

            if (opt.href && !opt.disabled) {
              return (
                <a
                  key={opt.title}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {inner}
                </a>
              );
            }

            return (
              <button
                key={opt.title}
                onClick={opt.disabled ? undefined : opt.onClick}
                disabled={opt.disabled}
                className="block w-full text-left"
              >
                {inner}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
