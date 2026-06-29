"use client";

import { useState } from "react";
import { Geist } from "next/font/google";
import {
  SectionBadge,
  FieldLabel,
  TextInput,
  TextArea,
  Select,
  FieldRow,
  Divider,
  SubmitButton,
  ErrorMessage,
  SuccessState,
} from "./FormKit";
import { submitServiceRequest } from "../../../services/servicesApi.services";

const geist = Geist({ subsets: ["latin"] });

const CURRENT_BOOKING_OPTIONS = [
  { value: "phone", label: "Phone Calls" },
  { value: "email", label: "Email" },
  { value: "walkin", label: "Walk-in Only" },
  { value: "website", label: "New Website" },
];

const DESIRED_BOOKING_OPTIONS = [
  { value: "online", label: "Online Booking" },
  { value: "phone_and_online", label: "Phone & Online" },
  { value: "assisted", label: "Staff-Assisted Online" },
];

export default function AppointmentForm() {
  const [firmName, setFirmName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [currentBooking, setCurrentBooking] = useState(
    CURRENT_BOOKING_OPTIONS[0].value
  );
  const [desiredBooking, setDesiredBooking] = useState(
    DESIRED_BOOKING_OPTIONS[0].value
  );

  const [numLawyers, setNumLawyers] = useState(0);
  const [numOffices, setNumOffices] = useState(0);
  const [numPracticeAreas, setNumPracticeAreas] = useState(0);
  const [requirements, setRequirements] = useState("");

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
        type: "appointment",
        contactName: contactName || undefined,
        contactEmail,
        contactPhone: contactPhone || undefined,
        firmName: firmName || undefined,
        payload: {
          currentBooking,
          desiredBooking,
          numLawyers,
          numOffices,
          numPracticeAreas,
          requirements,
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
          message="We've received your request — our team will reach out shortly to discuss your booking system."
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
          <SectionBadge>Current Booking Process</SectionBadge>
          <FieldRow>
            <div>
              <FieldLabel>How do clients currently book appointments?</FieldLabel>
              <Select
                value={currentBooking}
                onChange={(e) => setCurrentBooking(e.target.value)}
              >
                {CURRENT_BOOKING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <FieldLabel>How should clients be able to book consultations?</FieldLabel>
              <Select
                value={desiredBooking}
                onChange={(e) => setDesiredBooking(e.target.value)}
              >
                {DESIRED_BOOKING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </FieldRow>
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
          <SectionBadge>Additional Requirements</SectionBadge>
          <FieldLabel>Tell us about any specific workflows or features you need.</FieldLabel>
          <TextArea
            rows={4}
            placeholder="i.e Clients should be able to select a practice area, choose a lawyer, and receive appointment reminders automatically."
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        <ErrorMessage message={error} />

        <SubmitButton loading={loading}>Request System Proposal</SubmitButton>
      </form>
    </div>
  );
}