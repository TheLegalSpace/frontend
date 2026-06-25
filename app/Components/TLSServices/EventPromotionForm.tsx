"use client";

import { useState, useRef } from "react";
import { Geist } from "next/font/google";
import {
  SectionBadge,
  FieldLabel,
  TextInput,
  Checkbox,
  Divider,
  SubmitButton,
  ErrorMessage,
  SuccessState,
} from "./FormKit";
import {
  submitEventPromotion,
  computeEventPromotionPricing,
} from "../../../services/servicesApi.services";

const geist = Geist({ subsets: ["latin"] });

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function EventPromotionForm() {
  const [flyer, setFlyer] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [links, setLinks] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [shareOnSocial, setShareOnSocial] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [firmName, setFirmName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pricing = computeEventPromotionPricing(startAt, endAt, shareOnSocial);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setError("Flyer must be a PNG or JPG file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Flyer must be 10MB or smaller.");
      return;
    }

    setError(null);
    setFlyer(file);
    setFlyerPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!flyer) {
      setError("Please upload a flyer image.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter an event title.");
      return;
    }
    if (!startAt || !endAt) {
      setError("Please select a start and end date.");
      return;
    }
    if (new Date(endAt) < new Date(startAt)) {
      setError("End date must be on or after the start date.");
      return;
    }

    setLoading(true);
    try {
      await submitEventPromotion({
        flyer,
        title: title.trim(),
        startAt: new Date(startAt).toISOString(),
        endAt: new Date(endAt).toISOString(),
        shareOnSocial,
        links,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        firmName: firmName || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className={geist.className}>
        <SuccessState
          title="Event submitted"
          message="Your event has been published and will appear on The Legal Space feed and 'On The Docket' for its scheduled dates."
        />
      </div>
    );
  }

  const formatNaira = (kobo: number) => `₦${kobo.toLocaleString("en-NG")}`;

  return (
    <div className={geist.className}>

      <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col max-w-2xl">
        <div>
          <SectionBadge>Promotion Assets</SectionBadge>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border border-gray-200 px-4 py-4 flex items-center gap-3 text-left hover:border-blue-300 transition"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#eff6ff" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: "#2563eb" }}>
                {flyer ? flyer.name : "Click to upload flyer"}
              </p>
              <p className="text-[11px] text-gray-400">PNG, JPG (max. 800x400px)</p>
            </div>
          </button>

          {flyerPreview && (
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 w-1/2">
                <img
                src={flyerPreview}
                alt="Flyer preview"
                className="w-full h-auto object-contain"
                />
            </div>
          )}

          <div className="mt-4">
            <FieldLabel>Event Title</FieldLabel>
            <TextInput
              required
              placeholder="e.g. NBA Ikeja Law Week 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <Divider />

        <div>
          <SectionBadge>Additional Information</SectionBadge>
          <FieldLabel>
            Add links for attendees: WhatsApp group, ticket page, event website,
            Linktree, registration form, or social media.
          </FieldLabel>
          <TextInput
            placeholder="Paste a link or leave blank"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Separate multiple links with commas. The first link becomes the
            event's registration link.
          </p>
        </div>

        <Divider />

        <div>
          <SectionBadge>Promotion Options</SectionBadge>
          <FieldLabel>
            Pick how many days you want TLS to promote your event (₦1,000 a day)
          </FieldLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <FieldLabel>Select Date</FieldLabel>
              <TextInput
                type="date"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>End Date</FieldLabel>
              <TextInput
                type="date"
                required
                min={startAt || undefined}
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          <FieldLabel>Where would you like your event to be promoted?</FieldLabel>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Checkbox label="TLS Platform Listing (Included)" checked onChange={() => {}} />
            <Checkbox
              label="Share on TLS Social Media (+₦5,000)"
              checked={shareOnSocial}
              onChange={() => setShareOnSocial((v) => !v)}
            />
          </div>
        </div>

        <Divider />

        <div>
          <SectionBadge>Contact Information (Optional)</SectionBadge>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Law Firm Name</FieldLabel>
              <TextInput
                placeholder="What is your firm's name? Leave blank if not."
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Full Name</FieldLabel>
              <TextInput
                placeholder="What is your fullname?"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>
          <div className="h-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <TextInput
                type="email"
                placeholder="What is your email?"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <TextInput
                type="tel"
                placeholder="Enter your phone number"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <SectionBadge>Payment Summary</SectionBadge>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <SummaryRow label="Promotion Period" value={`${pricing.days} Days`} />
            <SummaryRow label="Promotion Fee" value={formatNaira(pricing.promotionFee)} />
            <SummaryRow
              label="Social Media Promotion"
              value={shareOnSocial ? formatNaira(pricing.socialFee) : "Not Included"}
            />
            <SummaryRow
              label="Total"
              value={`${formatNaira(pricing.total)}.00`}
              bold
              last
            />
          </div>
        </div>

        <ErrorMessage message={error} />

        <SubmitButton loading={loading}>Make Payment</SubmitButton>
      </form>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  last,
}: {
  label: string;
  value: string;
  bold?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 text-[13px] ${
        !last ? "border-b border-gray-100" : ""
      } ${bold ? "bg-gray-50" : "bg-white"}`}
    >
      <span className={bold ? "text-gray-900 font-medium" : "text-gray-400"}>
        {label}
      </span>
      <span className={bold ? "text-gray-900 font-semibold" : "text-gray-900 font-medium"}>
        {value}
      </span>
    </div>
  );
}