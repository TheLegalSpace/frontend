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
} from "@/services/intake.services";

import { SendRequestPayload } from "@/services/requests.services";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";
import { useSearchLawyers, useSearchByText } from "@/hooks/useIntake";
import { useSendRequest } from "@/hooks/useRequests";

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

function LawyerCard({
  match,
  extracted,
}: {
  match: MatchResult;
  extracted: ExtractedIntake;
}) {
  const sendRequest = useSendRequest();

  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const { account, score, matchedFactors } = match;

  const handleSend = async () => {
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
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send request");
    }
  };

  return (
    <div className="rounded-3xl border border-[#F0F0F0] bg-white p-5 transition-all hover:shadow-xl hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          {/* Avatar: show image if available, otherwise initials */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-semibold text-sm shrink-0 ${getAvatarColor(
              account.fullName,
            )}`}
          >
            {account.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt={account.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(account.fullName)
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-semibold text-[#202020] truncate">
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
              <p className="text-[13px] text-[#707070] mt-1 line-clamp-2 leading-relaxed">
                {account.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {account.locationCity && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F7] px-3 py-1.5 text-[12px] text-[#666]">
                  <MapPin className="w-3 h-3" />
                  {account.locationCity}, {account.locationCountry}
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F7] px-3 py-1.5 text-[12px] text-[#666]">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {parseFloat(account.avgRating || "0").toFixed(1)}
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F7F7] px-3 py-1.5 text-[12px] text-[#666]">
                <Users className="w-3 h-3" />
                {account.connectionCount}+ connections
              </div>

              {account.lawyerProfile && (
                <div className="inline-flex items-center rounded-full bg-[#F7F7F7] px-3 py-1.5 text-[12px] text-[#666]">
                  {formatFeeRange(
                    account.lawyerProfile.feeRangeMin,
                    account.lawyerProfile.feeRangeMax,
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#EFFAF2] px-3 py-2 text-center min-w-[70px] shrink-0">
          <p className="text-[16px] font-bold text-[#159947]">{score}%</p>
          <p className="text-[11px] text-[#159947]">Match</p>
        </div>
      </div>

      {matchedFactors.length > 0 && (
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
      )}

      {error && <p className="text-[12px] text-red-500 mt-4">{error}</p>}

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="h-11 rounded-2xl border border-[#EAEAEA] text-[13px] font-medium text-[#444] hover:bg-[#FAFAFA] transition-colors">
          View Profile
        </button>

        <button
          onClick={handleSend}
          disabled={sent || sendRequest.isPending}
          className={`h-11 rounded-2xl text-[13px] font-medium transition-all flex items-center justify-center gap-2 ${
            sent
              ? "bg-green-500 text-white"
              : "bg-[#1D4ED8] text-white hover:bg-[#1B46C4]"
          }`}
        >
          {sendRequest.isPending ? (
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

export default function FindALawyer() {
  const practiceAreas = usePracticeAreas();
  const [inputValue, setInputValue] = useState("");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [validationError, setValidationError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const searchByText = useSearchByText();
  const searchLawyers = useSearchLawyers();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    practiceAreas.refetch();
  }, [searchState]);

  const handleSearch = async (text: string) => {
    if (text.length < 10) {
      setValidationError(
        "Please describe your situation in at least 10 characters",
      );
      return;
    }

    setValidationError("");
    setHasSearched(true);
    localStorage.setItem("freeText", text);

    try {
      const result = await searchByText.mutateAsync({ text });

      setSearchState({
        results: result.items,
        extracted: result.extracted,
        total: result.pagination.total,
      });
    } catch (err: any) {
      setValidationError(err?.response?.data?.message ?? "Search failed");
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
    setHasSearched(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const extracted = searchState?.extracted;

  const isSearching = searchByText.isPending || searchLawyers.isPending;

  return (
    <div className="grid grid-cols-[55%_45%] h-[calc(100vh-64px)] bg-[#FAFAFA] overflow-hidden">
      {/* LEFT PANEL */}
      <div className="bg-white border-r border-[#ECECEC] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="h-[72px] border-b border-[#F0F0F0] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[28px] font-serif text-[#202020]">
              Get A Lawyer
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
            <div className="max-w-xl pt-12">
              <div className="w-14 h-14 rounded-2xl bg-[#EEF4FF] flex items-center justify-center mb-8">
                <Send className="w-6 h-6 text-[#1D4ED8]" />
              </div>

              <h2 className="text-[40px] leading-tight font-serif text-[#202020] max-w-lg">
                Tell us about your legal situation.
              </h2>

              <p className="mt-6 text-[15px] leading-8 text-[#6B6B6B] max-w-xl">
                Describe your issue naturally. Mention your location, approximate
                budget, and the kind of legal help you need.
              </p>

              <div className="mt-10 rounded-3xl border border-[#ECECEC] bg-[#FCFCFC] p-6">
                <p className="text-[13px] text-[#9B9B9B] uppercase tracking-wide mb-3">
                  Example
                </p>

                <p className="text-[15px] leading-8 text-[#444]">
                  "My landlord is trying to evict me illegally in Lagos and I can
                  pay around ₦150k for legal representation."
                </p>
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

          {!isSearching && searchState && extracted && (
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-[42px] font-serif text-[#202020] leading-none">
                Search Result
              </h2>

              {searchState && (
                <p className="text-[14px] text-[#777] mt-3">
                  {searchState.total} lawyer
                  {searchState.total !== 1 ? "s" : ""} matched your request
                </p>
              )}
            </div>
          </div>

          {!hasSearched && (
            <div className="h-[70vh] flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 rounded-3xl bg-white border border-[#EFEFEF] shadow-sm mx-auto flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-[#999]" />
                </div>

                <h3 className="text-[20px] font-semibold text-[#202020]">
                  Lawyer matches will appear here
                </h3>

                <p className="text-[15px] leading-7 text-[#777] mt-4">
                  Once you describe your legal situation, we will find the best
                  lawyers based on expertise, budget, and location.
                </p>
              </div>
            </div>
          )}

          {!isSearching && searchState && (
            <div className="space-y-5">
              {searchState.results.length > 0 ? (
                searchState.results.map((match) => (
                  <LawyerCard
                    key={match.account.id}
                    match={match}
                    extracted={searchState.extracted}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-[#ECECEC] bg-white p-10 text-center">
                  <h3 className="text-[18px] font-semibold text-[#202020]">
                    No matching lawyers found
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
  );
}
