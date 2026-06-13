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
  RadioOption,
  SubmitButton,
  ErrorMessage,
  SuccessState,
} from "./FormKit";
import { submitServiceRequest } from "../../../services/servicesApi.services";
import type {
  ConsultingHelpArea,
  ConsultationType,
  MeetingFormat,
} from "../../types/services";

const geist = Geist({ subsets: ["latin"] });

const HELP_AREAS: ConsultingHelpArea[] = [
  "Digital Transformation",
  "Workflow Optimization",
  "Legal-Tech Strategy",
  "Law Firm Automation",
  "Process Improvement",
  "Other",
];

const CONSULTATION_TYPES: { value: ConsultationType; label: string }[] = [
  { value: "30min", label: "30-Minute Consultation" },
  { value: "60min", label: "60-Minute Consultation" },
  { value: "assessment", label: "Project Assessment" },
];

const MEETING_FORMATS: { value: MeetingFormat; label: string }[] = [
  { value: "virtual", label: "Virtual Meeting" },
  { value: "physical", label: "Physical Meeting" },
  { value: "none", label: "No Preference" },
];

export default function ConsultationForm() {
  const [firmName, setFirmName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [helpAreas, setHelpAreas] = useState<ConsultingHelpArea[]>([]);

  const [consultationType, setConsultationType] =
    useState<ConsultationType>("30min");
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat>("virtual");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [challenge, setChallenge] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleHelpArea(area: ConsultingHelpArea) {
    setHelpAreas((prev) =>
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
    if (!preferredDate || !preferredTime) {
      setError("Please select a preferred date and time.");
      return;
    }

    setLoading(true);
    try {
      await submitServiceRequest({
        type: "consulting",
        contactName: contactName || undefined,
        contactEmail,
        contactPhone: contactPhone || undefined,
        firmName: firmName || undefined,
        payload: {
          helpAreas,
          consultationType,
          meetingFormat,
          preferredDate,
          preferredTime,
          challenge,
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
          title="Consultation requested"
          message="We've received your request — our team will reach out shortly to confirm your consultation."
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
          <SectionBadge>Improvement Areas</SectionBadge>
          <FieldLabel>What would you like help with?</FieldLabel>
          <div className="flex flex-col gap-3 mt-1">
            {HELP_AREAS.map((area) => (
              <Checkbox
                key={area}
                label={area}
                checked={helpAreas.includes(area)}
                onChange={() => toggleHelpArea(area)}
              />
            ))}
          </div>
        </div>

        <Divider />

        <div>
          <SectionBadge>Consultation Details</SectionBadge>

          <FieldLabel>Consultation Type</FieldLabel>
          <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5">
            {CONSULTATION_TYPES.map((opt) => (
              <RadioOption
                key={opt.value}
                name="consultationType"
                label={opt.label}
                checked={consultationType === opt.value}
                onChange={() => setConsultationType(opt.value)}
              />
            ))}
          </div>

          <FieldLabel>Preferred Meeting Format</FieldLabel>
          <div className="flex flex-wrap gap-x-8 gap-y-2 mb-5">
            {MEETING_FORMATS.map((opt) => (
              <RadioOption
                key={opt.value}
                name="meetingFormat"
                label={opt.label}
                checked={meetingFormat === opt.value}
                onChange={() => setMeetingFormat(opt.value)}
              />
            ))}
          </div>

          <FieldRow>
            <div>
              <FieldLabel>Preferred date</FieldLabel>
              <TextInput
                type="date"
                required
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>Preferred time</FieldLabel>
              <TextInput
                type="time"
                required
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              />
            </div>
          </FieldRow>
        </div>

        <Divider />

        <div>
          <SectionBadge>Consultation Requirements</SectionBadge>
          <FieldLabel>Tell us about the challenge you're facing.</FieldLabel>
          <TextArea
            rows={4}
            placeholder="i.e We want to digitize our internal processes and need guidance on selecting the right tools for document management and team collaboration."
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
          />
        </div>

        <ErrorMessage message={error} />

        <SubmitButton loading={loading}>Book Consultation</SubmitButton>
      </form>
    </div>
  );
}