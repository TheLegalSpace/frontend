"use client";

import { useState } from "react";
import { Geist } from "next/font/google";
import {
  SectionBadge,
  FieldLabel,
  TextInput,
  TextArea,
  FieldRow,
  Divider,
  Checkbox,
  SubmitButton,
  ErrorMessage,
  SuccessState,
} from "./FormKit";
import { submitServiceRequest } from "../../../services/servicesApi.services";
import type { ImprovementArea } from "../../types/services";

const geist = Geist({ subsets: ["latin"] });

const IMPROVEMENT_AREAS: ImprovementArea[] = [
  "Time Tracking",
  "Operational Dashboard",
  "Reporting & Analytics",
  "Staff Management",
  "Task Management",
  "Internal Approvals",
  "Other",
];

export default function ProductivityForm() {
  const [firmName, setFirmName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [improvementAreas, setImprovementAreas] = useState<ImprovementArea[]>([]);

  const [numLawyers, setNumLawyers] = useState(0);
  const [numOffices, setNumOffices] = useState(0);
  const [numPracticeAreas, setNumPracticeAreas] = useState(0);
  const [processToImprove, setProcessToImprove] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleArea(area: ImprovementArea) {
    setImprovementAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

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
        type: "productivity",
        contactName: contactName || undefined,
        contactEmail,
        contactPhone: contactPhone || undefined,
        firmName: firmName || undefined,
        payload: {
          improvementAreas,
          numLawyers,
          numOffices,
          numPracticeAreas,
          processToImprove,
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
          message="We've received your request — our team will reach out shortly to discuss your productivity tools."
        />
      </div>
    );
  }

  return (
    <div className={geist.className}>

      <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col max-w-2xl">
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
              <FieldLabel>Contact Person</FieldLabel>
              <TextInput
                placeholder="What's the name of your contact person?"
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
          <SectionBadge>Improvement Areas</SectionBadge>
          <FieldLabel>What would you like to improve?</FieldLabel>
          <div className="flex flex-col gap-3 mt-1">
            {IMPROVEMENT_AREAS.map((area) => (
              <Checkbox
                key={area}
                label={area}
                checked={improvementAreas.includes(area)}
                onChange={() => toggleArea(area)}
              />
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <SectionBadge>Firm Structure</SectionBadge>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FieldLabel>Number of Lawyers</FieldLabel>
              <TextInput
                type="number"
                min={0}
                value={numLawyers}
                onChange={(e) => setNumLawyers(Number(e.target.value))}
              />
            </div>
            <div>
              <FieldLabel>Number of Office Locations</FieldLabel>
              <TextInput
                type="number"
                min={0}
                value={numOffices}
                onChange={(e) => setNumOffices(Number(e.target.value))}
              />
            </div>
            <div>
              <FieldLabel>Number of Practice Areas</FieldLabel>
              <TextInput
                type="number"
                min={0}
                value={numPracticeAreas}
                onChange={(e) => setNumPracticeAreas(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <Divider />

        <div>
          <SectionBadge>Additional Information</SectionBadge>
          <FieldLabel>What process are you trying to improve or automate?</FieldLabel>
          <TextArea
            rows={4}
            placeholder="i.e We currently track staff performance in spreadsheets and want a dashboard that shows productivity, attendance, and completed tasks."
            value={processToImprove}
            onChange={(e) => setProcessToImprove(e.target.value)}
          />
        </div>

        <ErrorMessage message={error} />

        <SubmitButton loading={loading}>Request Solution</SubmitButton>
      </form>
    </div>
  );
}