"use client";

import { useState } from "react";
import { Geist } from "next/font/google";
import {
  SectionBadge,
  FieldLabel,
  TextInput,
  Select,
  FieldRow,
  Divider,
  SubmitButton,
  ErrorMessage,
  SuccessState,
} from "./FormKit";
import { submitServiceRequest } from "../../../services/servicesApi.services";
import type { WebsitePayload } from "../../types/services";

const geist = Geist({ subsets: ["latin"] });

const NEED_OPTIONS: { value: WebsitePayload["need"]; label: string }[] = [
  { value: "new", label: "New Website" },
  { value: "redesign", label: "Redesign Existing Website" },
  { value: "migration", label: "Migrate from WordPress" },
];

export default function WebsiteForm() {
  const [firmName, setFirmName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [need, setNeed] = useState<WebsitePayload["need"]>("new");
  const [hasWebsite, setHasWebsite] = useState<"yes" | "no">("yes");
  const [currentWebsiteUrl, setCurrentWebsiteUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!contactEmail) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);
    try {
      await submitServiceRequest({
        type: "website",
        contactName: contactName || undefined,
        contactEmail,
        contactPhone: contactPhone || undefined,
        firmName: firmName || undefined,
        payload: {
          need,
          hasWebsite: hasWebsite === "yes",
          ...(hasWebsite === "yes" && currentWebsiteUrl
            ? { currentWebsiteUrl }
            : {}),
        },
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
          title="Request received"
          message="We've received your request — our team will reach out shortly to discuss your new website."
        />
      </div>
    );
  }

  return (
    <div className={geist.className}>

      <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col max-w-full">
        <div>
          <SectionBadge>Contact Information</SectionBadge>
          <FieldRow>
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
          </FieldRow>
          <div className="h-4" />
          <FieldRow>
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <TextInput
                type="email"
                required
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
          </FieldRow>
        </div>

        <Divider />

        <div>
          <SectionBadge>Project Information</SectionBadge>
          <FieldRow>
            <div>
              <FieldLabel>What do you need?</FieldLabel>
              <Select
                value={need}
                onChange={(e) => setNeed(e.target.value as WebsitePayload["need"])}
              >
                {NEED_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>Do you currently have a website?</FieldLabel>
              <Select
                value={hasWebsite}
                onChange={(e) => setHasWebsite(e.target.value as "yes" | "no")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>
          </FieldRow>

          {hasWebsite === "yes" && (
            <div className="mt-4">
              <FieldLabel>Current Website URL</FieldLabel>
              <TextInput
                type="url"
                placeholder="Paste your website link."
                value={currentWebsiteUrl}
                onChange={(e) => setCurrentWebsiteUrl(e.target.value)}
              />
            </div>
          )}
        </div>

        <ErrorMessage message={error} />

        <SubmitButton loading={loading}>Request Website Proposal</SubmitButton>
      </form>
    </div>
  );
}