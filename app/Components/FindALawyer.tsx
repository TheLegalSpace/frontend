// components/intake/FindALawyer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  RotateCcw,
  Star,
  Users,
  MapPin,
  Loader2,
  Check,
  ShieldCheck,
} from "lucide-react"; 
import { MatchResult, SearchPayload, buildIntakeSteps } from "@/services/intake.services";
import { SendRequestPayload } from "@/services/requests.services";
import { usePracticeAreas } from "@/hooks/usePracticeAreas";
import { useSearchLawyers } from "@/hooks/useIntake";
import { useSendRequest } from "@/hooks/useRequests";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: "bot" | "user" | "results";
  text?: string;
  options?: { label: string; value: string }[];
  stepIndex?: number;
  results?: MatchResult[];
  searchPayload?: SearchPayload;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  return `${fmt(min)} – ${fmt(max)}`;
}

// ─── Lawyer Card ──────────────────────────────────────────────────────────────
function LawyerCard({
  match,
  searchPayload,
}: {
  match: MatchResult;
  searchPayload: SearchPayload;
}) {
  const sendRequest = useSendRequest();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const { account, score, matchedFactors } = match;

  const handleSend = async () => {
    setError("");
    try {
      const payload: SendRequestPayload = {
        lawyerAccountId: account.id,
        intakePayload: {
          matter: searchPayload.matter,
          budget: searchPayload.budget,
          location: searchPayload.location,
          preference: searchPayload.preference,
          freeText: searchPayload.freeText,
        },
      };
      await sendRequest.mutateAsync(payload);
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to send request.");
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-3">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0 overflow-hidden ${getAvatarColor(account.fullName)}`}
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-gray-900 truncate">
              {account.fullName}
            </p>
            {score > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 flex-shrink-0">
                {score}% match
              </span>
            )}
          </div>
          {account.bio && (
            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
              {account.bio}
            </p>
          )}
          {account.lawyerProfile?.verificationStatus === "verified" && (
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-blue-500" />
              <span className="text-[10px] text-blue-500">Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {account.locationCity && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
            <MapPin className="w-2.5 h-2.5" />
            {account.locationCity}, {account.locationCountry}
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          {parseFloat(account.avgRating || "0").toFixed(1)}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
          <Users className="w-2.5 h-2.5" />
          {account.connectionCount}+ connections
        </span>
        {account.lawyerProfile && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
            {formatFeeRange(
              account.lawyerProfile.feeRangeMin,
              account.lawyerProfile.feeRangeMax,
            )}
          </span>
        )}
      </div>

      {/* Matched factors */}
      {matchedFactors.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {matchedFactors.map((f) => (
            <span
              key={f}
              className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 capitalize"
            >
              {f.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      {error && <p className="text-[11px] text-red-500 mb-2">{error}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 border border-gray-200 rounded-lg text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Profile
        </button>
        <button
          onClick={handleSend}
          disabled={sent || sendRequest.isPending}
          className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 ${
            sent
              ? "bg-green-500 text-white"
              : "bg-[#1A56DB] text-white hover:bg-[#1648b8] disabled:opacity-50"
          }`}
        >
          {sendRequest.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : sent ? (
            <>
              <Check className="w-3 h-3" /> Sent
            </>
          ) : (
            "Send Request"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Option Pill ──────────────────────────────────────────────────────────────
function OptionPill({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-1.5 rounded-full border border-gray-200 text-[12px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FindALawyer() {
  const { data: practiceAreas, isLoading: areasLoading } = usePracticeAreas();
  const INTAKE_STEPS = practiceAreas ? buildIntakeSteps(practiceAreas) : [];

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SearchPayload>>({});
  const [inputValue, setInputValue] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const searchLawyers = useSearchLawyers();
  const initialized = useRef(false);

  // ✅ Initialize first message once practice areas load
  useEffect(() => {
    if (INTAKE_STEPS.length > 0 && !initialized.current) {
      initialized.current = true;
      setMessages([
        {
          id: "1",
          type: "bot",
          text: INTAKE_STEPS[0].question,
          options: INTAKE_STEPS[0].options,
          stepIndex: 0,
        },
      ]);
    }
  }, [INTAKE_STEPS.length]);

  // ✅ Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
    ]);
  };

  const handleAnswer = async (value: string, label: string) => {
    if (isComplete || INTAKE_STEPS.length === 0) return;

    const step = INTAKE_STEPS[currentStep];
    const newAnswers = { ...answers, [step.key]: value };
    setAnswers(newAnswers);

    // Show human-readable label in chat, send UUID/value to API
    addMessage({ type: "user", text: label });

    const nextStep = currentStep + 1;

    if (nextStep < INTAKE_STEPS.length) {
      setTimeout(() => {
        addMessage({
          type: "bot",
          text: INTAKE_STEPS[nextStep].question,
          options: INTAKE_STEPS[nextStep].options,
          stepIndex: nextStep,
        });
        setCurrentStep(nextStep);
      }, 400);
    } else {
      // All steps answered — search
      setIsComplete(true);
      const payload = newAnswers as SearchPayload;

      setTimeout(async () => {
        addMessage({
          type: "bot",
          text: "Finding the best lawyers for you...",
        });
        try {
          const result = await searchLawyers.mutateAsync({
            matter: payload.matter,
            budget: payload.budget,
            location: payload.location,
            preference: payload.preference,
            freeText: inputValue.trim(),
          });
          addMessage({
            type: "results",
            results: result.items,
            searchPayload: {
              ...payload,
              freeText: inputValue.trim(),
            },
          });
        } catch (err: any) {
          addMessage({
            type: "bot",
            text:
              err?.response?.data?.message ??
              "Could not find results. Please try again.",
          });
          setIsComplete(false);
        }
      }, 500);
    }
  };

  const handleTextSubmit = () => {
    if (!inputValue.trim() || isComplete || INTAKE_STEPS.length === 0) return;
    handleAnswer(inputValue.trim(), inputValue.trim());
    setInputValue("");
  };

  const handleRestart = () => {
    if (INTAKE_STEPS.length === 0) return;
    initialized.current = false;
    setTimeout(() => {
      initialized.current = true;
      setMessages([
        {
          id: Date.now().toString(),
          type: "bot",
          text: INTAKE_STEPS[0].question,
          options: INTAKE_STEPS[0].options,
          stepIndex: 0,
        },
      ]);
    }, 0);
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
    setInputValue("");
  };

  if (areasLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex items-center gap-2 text-[13px] text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-[15px] font-medium text-gray-900">Get A Lawyer</h1>
        {isComplete && (
          <button
            onClick={handleRestart}
            className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart search
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>

            {/* Bot message */}
            {msg.type === "bot" && (
              <div className="flex flex-col gap-2 max-w-xs">
                <p className="text-[13px] text-gray-800">{msg.text}</p>
                {msg.options && (
                  <div className="flex flex-wrap gap-2">
                    {msg.options.map((opt) => (
                      <OptionPill
                        key={opt.value}
                        label={opt.label}
                        disabled={
                          isComplete ||
                          searchLawyers.isPending ||
                          msg.stepIndex !== currentStep
                        }
                        onClick={() => handleAnswer(opt.value, opt.label)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* User message */}
            {msg.type === "user" && (
              <div className="flex justify-end">
                <span className="px-4 py-1.5 bg-[#1A56DB] text-white text-[12px] rounded-full max-w-xs text-right">
                  {msg.text}
                </span>
              </div>
            )}

            {/* Results */}
            {msg.type === "results" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[14px] font-medium text-gray-900">
                    Search Result
                  </p>
                  <button
                    onClick={handleRestart}
                    className="text-[12px] text-gray-400 hover:underline"
                  >
                    Back to Feeds
                  </button>
                </div>

                {msg.results && msg.results.length > 0 ? (
                  <>
                    {msg.results.map((match) => (
                      <LawyerCard
                        key={match.account.id}
                        match={match}
                        searchPayload={msg.searchPayload!}
                      />
                    ))}
                    <button className="w-full py-2 text-[12px] text-gray-400 hover:text-gray-600">
                      Show More ↓
                    </button>
                  </>
                ) : (
                  <div className="py-8 text-center text-[13px] text-gray-400 border border-gray-100 rounded-xl">
                    No lawyers found matching your criteria.
                    <br />
                    <button
                      onClick={handleRestart}
                      className="text-[12px] text-blue-600 hover:underline mt-2 block mx-auto"
                    >
                      Try different criteria
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Searching indicator */}
        {searchLawyers.isPending && (
          <div className="flex items-center gap-2 text-[12px] text-gray-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Searching...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTextSubmit();
            }}
            placeholder={
              isComplete ? "Search complete" : "Type something..."
            }
            disabled={isComplete || searchLawyers.isPending}
            className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleTextSubmit}
            disabled={
              !inputValue.trim() || isComplete || searchLawyers.isPending
            }
            className="w-8 h-8 bg-[#1A56DB] rounded-lg flex items-center justify-center disabled:opacity-40 transition-opacity flex-shrink-0"
            aria-label="Send"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}