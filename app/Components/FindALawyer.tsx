// components/intake/FindALawyer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  MapPin,
  RotateCcw,
  Send,
  ShieldCheck,
  Star,
  Users,
  Check,
} from "lucide-react";

import {
  MatchResult,
  SearchPayload,
  ExtractedIntake,
  buildIntakeSteps,
  BUDGET_OPTIONS,
} from "@/services/intake.services";

import { SendRequestPayload } from "@/services/requests.services";
import { useSearchByText } from "@/hooks/useIntake";
import { useSendRequest } from "@/hooks/useRequests";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";
import Image from "next/image";
import LawyerProfileView from "./LawyerProfileView";

type ClarifyKey = "matter" | "budget" | "location";

interface ClarifyState {
  originalText: string;
  extracted: ExtractedIntake;
  missing: ClarifyKey[]; // remaining questions to ask, in order
  message: string; // banner text straight from the API
}

interface SearchState {
  results: MatchResult[];
  extracted: ExtractedIntake;
  searchPayload?: SearchPayload;
  total: number;
}

function getInitials(name: string): string {
  if (!name) return "?";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  if (!name) return "bg-gray-100 text-gray-500";

  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
  ];

  return colors[name.charCodeAt(0) % colors.length];
}

function formatFeeRange(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000000
      ? `₦${(n / 1000000).toFixed(1)}M`
      : `₦${(n / 1000).toFixed(0)}k`;

  return `${fmt(min)} - ${fmt(max)}`;
}

function formatBudgetLabel(budget: string | null): string {
  if (!budget) return "";

  const map: Record<string, string> = {
    under_50k: "Under ₦50k",
    "50k_to_100k": "₦50k - ₦100k",
    "100k_to_500k": "₦100k - ₦500k",
    "500k_to_1m": "₦500k - ₦1M",
    above_1m: "Above ₦1M",
    under_100k: "Under ₦100k",
    "500k_to_2m": "₦500k - ₦2M",
    above_2m: "Above ₦2M",
  };

  return map[budget] ?? budget.replace(/_/g, " ");
}

// Folds the answers picked from the clarify chips back into the user's
// original free text as plain sentences, then that combined text is
// re-submitted to /matchmaking/search-by-text — reusing the same NLP
// endpoint rather than switching to the structured one.
function buildClarifiedText(
  originalText: string,
  extracted: ExtractedIntake,
): string {
  const sentences = [originalText.trim()];

  if (extracted.matter?.name) {
    sentences.push(`Legal matter: ${extracted.matter.name}.`);
  }
  if (extracted.budget) {
    const label =
      BUDGET_OPTIONS.find((o) => o.value === extracted.budget)?.label ??
      extracted.budget;
    sentences.push(`Budget: ${label}.`);
  }
  if (extracted.location) {
    sentences.push(`Location: ${extracted.location}.`);
  }

  return sentences.join(" ");
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err !== "object" || err === null) return fallback;

  const maybe = err as {
    response?: { data?: { message?: string } };
  };

  return maybe.response?.data?.message ?? fallback;
}

// Some backends send the "couldn't determine enough" clarify payload with
// a non-2xx HTTP status instead of HTTP 200 + error:true — axios rejects
// in that case, so the response never reaches a normal `try` block. This
// pulls the same { message, extracted } shape out of a thrown error, if
// present, so callers can branch into clarify mode either way.
function extractClarifyErrorBody(
  err: unknown,
): { message: string; extracted: ExtractedIntake } | null {
  if (typeof err !== "object" || err === null) return null;

  const maybe = err as {
    response?: {
      data?: {
        error?: boolean;
        message?: string;
        data?: { extracted?: ExtractedIntake };
      };
    };
  };

  const body = maybe.response?.data;
  if (body?.error && body.data?.extracted) {
    return {
      message: body.message ?? "We need a bit more information to search.",
      extracted: body.data.extracted,
    };
  }

  return null;
}

function QuestionBlock({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="pb-8 border-b border-[#EFEFEF] last:border-none">
      <div className="inline-flex items-center rounded-full border border-[#E67E22] px-5 py-2.5 bg-white shadow-sm">
        <p className="text-[14px] font-medium text-[#202020]">{question}</p>
      </div>

      <div className="mt-5">
        <div className="inline-flex items-center rounded-2xl bg-[#EEF4FF] px-5 py-3 text-[14px] font-medium text-[#2D6BFF] shadow-sm">
          {answer}
        </div>
      </div>
    </div>
  );
}

function ClarifyQuestion({
  question,
  options,
  onSelect,
  disabled,
}: {
  question: string;
  options: { label: string; value: string }[];
  onSelect: (option: { label: string; value: string }) => void;
  disabled?: boolean;
}) {
  return (
    <div className="pb-8 border-b border-[#EFEFEF] last:border-none">
      <div className="inline-flex items-center rounded-full border border-[#E67E22] px-5 py-2.5 bg-white shadow-sm">
        <p className="text-[14px] font-medium text-[#202020]">{question}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt)}
            className="rounded-2xl border border-[#EAEAEA] bg-[#F7F7F7] px-5 py-3 text-[14px] font-medium text-[#333] transition-colors hover:border-[#1D4ED8] hover:bg-[#EEF4FF] hover:text-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LawyerCard({
  match,
  extracted,
  onViewProfile,
}: {
  match: MatchResult;
  extracted: ExtractedIntake;
  onViewProfile: (accountId: string) => void;
}) {
  const sendRequest = useSendRequest();

  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const { account, score, matchedFactors } = match;

  const handleSend = async () => {
    if (isSending || sent) return;
    setIsSending(true);
    setError("");

    try {
      const freeText = localStorage.getItem("freeText");
      const payload: SendRequestPayload = {
        lawyerAccountId: account.id,
        intakePayload: {
          matter: extracted.matter?.id ?? "",
          budget: extracted.budget ?? "",
          location: extracted.location ?? "",
          preference: extracted.preference ?? "either",
          freeText: freeText ?? "null",
        },
      };

      await sendRequest.mutateAsync(payload);
      if (isMountedRef.current) {
        setSent(true);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err, "Failed to send request"));
      }
    } finally {
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  };

  return (
    <div className="rounded-lg border border-[#F0F0F0] bg-white p-5 transition-all ">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          {/* Avatar: show image if available, otherwise initials */}
          <div
            className={`relative w-14 h-14 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden ${getAvatarColor(
              account.fullName,
            )}`}
          >
            {account.avatarUrl ? (
              <Image
                src={account.avatarUrl}
                alt={account.fullName}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              getInitials(account.fullName)
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[24px] font-['Instrument_Serif'] text-[#202020] truncate">
                {account.fullName}
              </h3>

              {account.lawyerProfile?.verificationStatus === "verified" && (
                <div className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2 py-1 text-[11px] text-[#2D6BFF]">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>
              )}
            </div>

            {account.bio && (
              <p className="text-[12px] text-[#374151] mt-1 line-clamp-2 leading-[24px] font-['Geist'] font-light tracking-[0%]">
                {account.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {account.locationCity && (
                <div className="inline-flex items-center gap-1.5  bg-[#22C55E1A] px-3 py-1.5 text-[12px] text-[#22C55E]">
                  <MapPin className="w-3 h-3" />
                  {account.locationCity}, {account.locationCountry}
                </div>
              )}

              <div className="inline-flex items-center gap-1.5  bg-[#F5C4511A] px-3 py-1.5 text-[12px] text-[#F5C451]">
                <Star className="w-3 h-3 fill-[#F5C451] text-[#F5C451]" />
                {parseFloat(account.avgRating || "0").toFixed(1)}
              </div>

              <div className="inline-flex items-center gap-1.5  bg-[#0084FF1A] px-3 py-1.5 text-[12px] text-[#0084FF]">
                <Users className="w-3 h-3" />
                {account.connectionCount}+ connections
              </div>

              {/* {account.lawyerProfile && (
                <div className="inline-flex items-center  bg-[#F7F7F7] px-3 py-1.5 text-[12px] text-[#666]">
                  {formatFeeRange(
                    account.lawyerProfile.feeRangeMin,
                    account.lawyerProfile.feeRangeMax,
                  )}
                </div>
              )} */}
            </div>
          </div>
        </div>

        <div
          className={`rounded-full  px-6 py-2 text-center min-w-17.5 shrink-0 flex items-center gap-2 ${
            score >= 80
              ? "bg-[#EFFAF2] text-[#159947]"
              : score > 40
                ? "bg-[#FFF4F4] text-[#C48529]"
                : "bg-[#FFF4F4] text-[#C42929]"
          }`}
        >
          <p
            className={`text-[10px] font-semibold ${
              score >= 80
                ? "text-[#159947]"
                : score > 40
                  ? "text-[#C48529]"
                  : "text-[#C42929]"
            }`}
          >
            {score}%
          </p>
          <p
            className={`text-[10px] font-semibold ${
              score >= 80
                ? "text-[#159947]"
                : score > 40
                  ? "text-[#C48529]"
                  : "text-[#C42929]"
            }`}
          >
            Match
          </p>
        </div>
      </div>

      {/* {matchedFactors.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {matchedFactors.map((factor) => (
            <div
              key={factor}
              className="rounded-full border border-[#ECECEC] px-3 py-1 text-[11px] text-[#666] capitalize"
            >
              {factor.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      )} */}

      {error && <p className="text-[12px] text-red-500 mt-4">{error}</p>}

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button
          onClick={() => onViewProfile(account.id)}
          className="h-11 rounded border border-[#EAEAEA] text-[13px] font-medium text-[#444] hover:bg-[#FAFAFA] transition-colors"
        >
          Profile
        </button>

        <button
          onClick={handleSend}
          disabled={sent || isSending || sendRequest.isPending}
          className={`h-11 text-[13px] font-medium transition-all flex items-center justify-center gap-2 rounded ${
            sent
              ? "bg-green-500 text-white"
              : "bg-[#1D4ED8] text-white hover:bg-[#1B46C4]"
          }`}
        >
          {isSending || sendRequest.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : sent ? (
            <>
              <Check className="w-4 h-4" />
              Sent
            </>
          ) : (
            "Send Request"
          )}
        </button>
      </div>
    </div>
  );
}
// Same gradient-border technique used for the sidebar's "Get a lawyer"
// pill — a transparent border painted with two layered backgrounds so the
// gradient only shows on the border, not the fill.
function GradientPill({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#202020] shadow-sm"
      style={{
        border: "2px solid transparent",
        backgroundImage:
          "linear-gradient(white, white), linear-gradient(90deg, #216399 0%, #FFE500 50%, #C34B00 100%)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
      }}
    >
      {children}
    </div>
  );
}

export default function FindALawyer() {
  const [inputValue, setInputValue] = useState("");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [validationError, setValidationError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [clarifyState, setClarifyState] = useState<ClarifyState | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "firms" | "lawyers">(
    "firms",
  );
  // When set, show that account's profile in place (search results stay mounted).
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const searchByText = useSearchByText();
  const { data: practiceAreas } = usePracticeAreas();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [searchState, clarifyState]);

  // Steps for whichever fields still need answers, sourced from the same
  // practice-areas list and option constants used by the dashboard's
  // "Get a Lawyer" intake flow — keeps the chip choices consistent.
  const clarifySteps = buildIntakeSteps(practiceAreas ?? []).filter(
    (step) =>
      step.key === "matter" || step.key === "budget" || step.key === "location",
  );

  // Applies the "which fields are missing" branching logic. Shared between
  // the resolved-response path (backend returns 200 with error:true) and
  // the thrown-error path (backend returns a non-2xx status instead) —
  // we can't assume which one a given endpoint/deployment actually uses.
  const applyClarifyOrError = (
    text: string,
    message: string,
    extracted: ExtractedIntake,
  ) => {
    const missing = (["matter", "budget", "location"] as ClarifyKey[]).filter(
      (key) => (key === "matter" ? !extracted.matter : !extracted[key]),
    );

    if (missing.length > 0) {
      setClarifyState({ originalText: text, extracted, missing, message });
      return;
    }

    // Backend flagged an error but nothing is actually missing on our
    // end — surface its message rather than guessing further.
    setValidationError(message);
  };

  // Re-submits to /matchmaking/search-by-text with the clarified answers
  // folded into the original text, rather than switching to the structured
  // /matchmaking/search endpoint. Same NLP endpoint, richer input.
  const runClarifiedSearch = async (
    extracted: ExtractedIntake,
    originalText: string,
  ) => {
    setValidationError("");

    const clarifiedText = buildClarifiedText(originalText, extracted);
    localStorage.setItem("freeText", clarifiedText);

    try {
      const res = await searchByText.mutateAsync({ text: clarifiedText });

      if (res.error) {
        // Backend still couldn't extract enough even with the clarified
        // details appended — surface whatever's still missing instead of
        // looping forever.
        applyClarifyOrError(originalText, res.message, res.data.extracted);
        return;
      }

      setSearchState({
        results: res.data.items,
        extracted: res.data.extracted,
        total: res.data.pagination.total,
      });
      setClarifyState(null);
    } catch (err: unknown) {
      const clarify = extractClarifyErrorBody(err);
      if (clarify) {
        applyClarifyOrError(originalText, clarify.message, clarify.extracted);
        return;
      }

      setValidationError(getErrorMessage(err, "Search failed"));
    }
  };

  const handleClarifyAnswer = (
    key: ClarifyKey,
    option: { label: string; value: string },
  ) => {
    if (!clarifyState) return;

    const nextExtracted: ExtractedIntake = {
      ...clarifyState.extracted,
      ...(key === "matter"
        ? { matter: { id: option.value, name: option.label } }
        : { [key]: option.value }),
    };

    const nextMissing = clarifyState.missing.filter((k) => k !== key);

    if (nextMissing.length === 0) {
      // All required fields answered — submit immediately.
      setClarifyState({
        ...clarifyState,
        extracted: nextExtracted,
        missing: nextMissing,
      });
      runClarifiedSearch(nextExtracted, clarifyState.originalText);
      return;
    }

    setClarifyState({
      ...clarifyState,
      extracted: nextExtracted,
      missing: nextMissing,
    });
  };

  const handleSearch = async (text: string) => {
    if (text.length < 10) {
      setValidationError(
        "Please describe your situation in at least 10 characters",
      );
      return;
    }

    setValidationError("");
    setClarifyState(null);
    setHasSearched(true);
    localStorage.setItem("freeText", text);

    try {
      const res = await searchByText.mutateAsync({ text });

      if (res.error) {
        applyClarifyOrError(text, res.message, res.data.extracted);
        return;
      }

      setSearchState({
        results: res.data.items,
        extracted: res.data.extracted,
        total: res.data.pagination.total,
      });
    } catch (err: unknown) {
      // Some backends send this same "couldn't determine enough" payload
      // with a non-2xx status instead of HTTP 200 — axios rejects in that
      // case, so the response never reaches the `try` block above. Check
      // the thrown error's payload for the same shape before giving up
      // and showing a generic failure message.
      const clarify = extractClarifyErrorBody(err);
      if (clarify) {
        applyClarifyOrError(text, clarify.message, clarify.extracted);
        return;
      }

      setValidationError(getErrorMessage(err, "Search failed"));
    }
  };

  const handleSubmit = () => {
    const text = inputValue.trim();

    if (!text || searchByText.isPending) return;

    handleSearch(text);
  };

  const handleRestart = () => {
    setInputValue("");
    setSearchState(null);
    setValidationError("");
    setClarifyState(null);
    setHasSearched(false);
    setActiveTab("all");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const extracted = searchState?.extracted;

  const isSearching = searchByText.isPending;

  const classifyAccountType = (account: MatchResult["account"]) => {
    const role = (account.role ?? "").toUpperCase();

    if (role === "FIRM" || account.firmProfile) return "firm";
    if (role === "LAWYER" || account.lawyerProfile) return "lawyer";

    return "lawyer";
  };

  const firmResults =
    searchState?.results.filter(
      (r) => classifyAccountType(r.account) === "firm",
    ) ?? [];
  const lawyerResults =
    searchState?.results.filter(
      (r) => classifyAccountType(r.account) === "lawyer",
    ) ?? [];

  // "All" should show firms first per product request.
  const orderedResults =
    activeTab === "firms"
      ? firmResults
      : activeTab === "lawyers"
        ? lawyerResults
        : [...firmResults, ...lawyerResults];

  const resultsSummaryText = (() => {
    if (!searchState) return "";
    if (activeTab === "all") {
      return `${searchState.total} account${
        searchState.total === 1 ? "" : "s"
      } matched your request`;
    }

    const noun = activeTab === "firms" ? "firms" : "lawyers";
    return `Showing ${orderedResults.length} ${noun} in your results`;
  })();

  const emptyStateTitle =
    activeTab === "all"
      ? "No matching accounts found"
      : `No matching ${activeTab === "firms" ? "firms" : "lawyers"} found`;

  return (
    <>
      {/* In-place lawyer/firm profile — search results stay in memory */}
      {selectedAccountId && (
        <LawyerProfileView
          accountId={selectedAccountId}
          onBack={() => setSelectedAccountId(null)}
        />
      )}

      <div
        className={`grid grid-cols-[55%_45%] h-[calc(100vh-64px)] bg-[#FAFAFA] overflow-hidden ${
          selectedAccountId ? "hidden" : ""
        }`}
      >
        {/* LEFT PANEL */}
        <div className="bg-white border-r border-[#ECECEC] flex flex-col overflow-hidden">
          {/* HEADER */}
          <div className="h-18 border-b border-[#F0F0F0] px-8 flex items-center justify-between shrink-0">
            <div>
              <h1 className="text-[28px] font-serif text-[#202020]">
                Get a Lawyer
              </h1>
            </div>

            {hasSearched && (
              <button
                onClick={handleRestart}
                className="rounded-full bg-[#F7F7F7] px-4 py-2 text-[12px] text-[#555] hover:bg-[#EFEFEF] transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart search
              </button>
            )}
          </div>

          {/* CONVERSATION */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
           {!hasSearched && (
              <div className="max-w-2xl">
                <div className="pb-8 border-b border-[#EFEFEF]">
                  <GradientPill>The Legal Space AI</GradientPill>

                  <p className="mt-6 text-[15px] leading-8 text-[#6B6B6B] max-w-xl">
                    Tell me your situation in plain language. I will read
                    your intent, tag it to the right area of law, and match
                    you with verified professionals.
                  </p>

                  <p className="mt-2 text-[15px] leading-8 font-bold text-[#3A3A3A] max-w-xl">
                    Note: Only send a request if you&apos;re ready to speak
                    with a lawyer.
                  </p>
                </div>

                <div className="pt-8">
                  <GradientPill>What is your legal matter about?</GradientPill>
                </div>
              </div>
            )}

            {isSearching && (
              <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-[#1D4ED8] animate-spin" />

                  <div className="text-center">
                    <p className="text-[16px] font-medium text-[#202020]">
                      Analysing your request
                    </p>

                    <p className="text-[14px] text-[#777] mt-1">
                      Finding the best legal matches for you...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isSearching && clarifyState && (
              <div className="max-w-2xl">
                <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <p className="text-[13px] leading-6 text-amber-800">
                    {clarifyState.message}
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Already-known fields, shown as resolved bubbles */}
                  {clarifySteps
                    .filter(
                      (step) =>
                        !clarifyState.missing.includes(step.key as ClarifyKey),
                    )
                    .map((step) => {
                      const key = step.key as ClarifyKey;
                      const answer =
                        key === "matter"
                          ? clarifyState.extracted.matter?.name
                          : clarifyState.extracted[key];
                      return (
                        <QuestionBlock
                          key={step.key}
                          question={step.question}
                          answer={answer || "—"}
                        />
                      );
                    })}

                  {/* The field we're currently asking about */}
                  {clarifyState.missing.length > 0 &&
                    (() => {
                      const currentKey = clarifyState.missing[0];
                      const step = clarifySteps.find(
                        (s) => s.key === currentKey,
                      );
                      if (!step) return null;
                      return (
                        <ClarifyQuestion
                          question={step.question}
                          options={step.options}
                          disabled={searchByText.isPending}
                          onSelect={(option) =>
                            handleClarifyAnswer(currentKey, option)
                          }
                        />
                      );
                    })()}
                </div>
              </div>
            )}

            {!isSearching && !clarifyState && searchState && extracted && (
              <div className="max-w-2xl space-y-8">
                <QuestionBlock
                  question="What is your legal matter about?"
                  answer={extracted.matter?.name || "General Legal Matter"}
                />

                <QuestionBlock
                  question="What is your budget?"
                  answer={formatBudgetLabel(extracted.budget) || "Flexible"}
                />

                <QuestionBlock
                  question="Where do you need legal help?"
                  answer={extracted.location || "Anywhere"}
                />

                <QuestionBlock
                  question="Who would you prefer?"
                  answer={extracted.preference || "Either"}
                />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="border-t border-[#ECECEC] bg-white px-6 py-5 shrink-0">
            {validationError && (
              <p className="text-[12px] text-red-500 mb-3">{validationError}</p>
            )}

            <div className="flex items-end gap-3 rounded-3xl border border-[#EAEAEA] bg-white px-5 py-4 shadow-sm">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                disabled={isSearching}
                placeholder="Describe your legal situation..."
                onChange={(e) => {
                  setInputValue(e.target.value);

                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(
                    e.target.scrollHeight,
                    140,
                  )}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="flex-1 resize-none bg-transparent outline-none text-[15px] leading-7 text-[#202020] placeholder:text-[#999] max-h-35"
              />

              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isSearching}
                className="w-12 h-12 rounded-2xl bg-[#1D4ED8] flex items-center justify-center hover:bg-[#1947C6] transition-colors disabled:opacity-40 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>

            <p className="text-center text-[11px] text-[#B0B0B0] mt-3">
              Press Enter to search
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="bg-[#FCFCFC] overflow-y-auto">
          <div className="px-8 py-8 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[32px] font-serif text-[#202020] leading-none">
                  Search Result
                </h2>

                {searchState && (
                  <p className="text-[14px] text-[#777] mt-3">
                    {resultsSummaryText}
                  </p>
                )}
              </div>
            </div>

            {searchState && (
              <div className="flex gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => setActiveTab("firms")}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    activeTab === "firms"
                      ? "bg-[#1D4ED8] border-[#1D4ED8] text-white"
                      : "bg-white border-[#EAEAEA] text-[#444] hover:bg-[#FAFAFA]"
                  }`}
                >
                  Firms
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("lawyers")}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    activeTab === "lawyers"
                      ? "bg-[#1D4ED8] border-[#1D4ED8] text-white"
                      : "bg-white border-[#EAEAEA] text-[#444] hover:bg-[#FAFAFA]"
                  }`}
                >
                  Lawyers
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    activeTab === "all"
                      ? "bg-[#1D4ED8] border-[#1D4ED8] text-white"
                      : "bg-white border-[#EAEAEA] text-[#444] hover:bg-[#FAFAFA]"
                  }`}
                >
                  All
                </button>
              </div>
            )}

            {!hasSearched && (
              <div className="h-[70vh] flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-16 h-16 rounded-3xl bg-white border border-[#EFEFEF] shadow-sm mx-auto flex items-center justify-center mb-6">
                    <Users className="w-7 h-7 text-[#999]" />
                  </div>

                  <h3 className="text-[20px] font-semibold text-[#202020]">
                    Firm and lawyer matches will appear here
                  </h3>

                  <p className="text-[15px] leading-7 text-[#777] mt-4">
                    Once you describe your legal situation, we will find the
                    best legal matches (law firms and independent lawyers) based
                    on expertise, budget, and location.
                  </p>
                </div>
              </div>
            )}

            {!isSearching && searchState && (
              <div className="space-y-5">
                {orderedResults.length > 0 ? (
                  orderedResults.map((match) => (
                    <LawyerCard
                      key={match.account.id}
                      match={match}
                      extracted={searchState.extracted}
                      onViewProfile={setSelectedAccountId}
                    />
                  ))
                ) : (
                  <div className="rounded-3xl border border-[#ECECEC] bg-white p-10 text-center">
                    <h3 className="text-[18px] font-semibold text-[#202020]">
                      {emptyStateTitle}
                    </h3>

                    <p className="text-[14px] text-[#777] mt-3 leading-7 max-w-md mx-auto">
                      Try adjusting your legal description, budget, or preferred
                      location to broaden the search.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
