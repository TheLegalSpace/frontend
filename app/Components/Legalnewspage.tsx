"use client";

import { useState } from "react";
import { BookOpen, Check } from "lucide-react";

const PREVIEW_ARTICLES = [
  {
    tag: "Tax Law",
    tagColor: "text-blue-600 bg-blue-50",
    date: "4 hours ago",
    title:
      "FIRS Issues New Transfer Pricing Compliance Circular for Multinational Entities Operating in Nigeria",
    excerpt:
      "The Federal Inland Revenue Service has released updated guidelines tightening compliance requirements for transfer pricing documentation among multinational entities, with penalties for non-compliance reaching ₦50 million per primary offence — up 200%.",
    highlight: {
      label: "WHAT THIS MEANS FOR YOU",
      text: "Companies with active CBTS must review and update their transfer circular made in the last 36 months. This ruling strengthens prior standing and reinforces mandatory compliance obligations before the upcoming renewal terms.",
    },
    avatar: "D",
    avatarColor: "bg-pink-500",
    readTime: "3 min read",
  },
];

const USE_OPTIONS = ["Not really", "Yes, I would use it"];

const NEWS_TYPES = [
  "Supreme Court decisions",
  "Regulatory updates",
  "Commercial law news",
  "Nigerian legal industry news",
  "International legal trends",
  "Litigation & arbitration",
  "Law firm & career news",
  "AI & legal tech",
];

export default function LegalNewsPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [useChoice, setUseChoice] = useState<string | null>(null);
  const [newsChoices, setNewsChoices] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleNews(item: string) {
    setNewsChoices((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  }

  function handleSubmit() {
    if (!useChoice) return;
    setSubmitted(true);
  }

  return (
    <div className="h-screen bg-white font-['Geist'] flex flex-col overflow-hidden">
      {/* Fixed header */}
      <div className="shrink-0 fixed top-0 z-10 bg-white w-full">
        <h1 className="text-[22px] font-normal text-gray-900 font-['Instrument_Serif'] ps-4 pt-6 pb-4">
          Legal News
        </h1>

        {/* Coming soon banner */}
        <div className="flex items-center gap-2 px-4 mb-2">
          <BookOpen size={14} className="text-[#c9972a]" />
          <span className="text-[11px] font-semibold tracking-widest text-[#c9972a] uppercase">
            Coming Soon
          </span>
          <span className="flex-1 h-px bg-[#c9972a]/20 ml-2"></span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-hidden pt-[100px]">
        <div className="h-full overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-4">
            {/* Blurred preview card */}
            <div className="relative border border-gray-200 overflow-hidden mb-6">
          {/* Blur overlay */}
          <div
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-all duration-300 ${showPreview ? "backdrop-blur-none bg-transparent pointer-events-none" : "backdrop-blur-xl bg-white/40"}`}
          >
            {!showPreview && (
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setShowPreview(true)}
                  className="bg-white border border-gray-200 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-2 hover:bg-gray-50 transition"
                >
                  <BookOpen size={15} className="text-gray-500" />
                  <span className="text-[13px] font-medium text-gray-700">
                    Preview
                  </span>
                </button>
                <p className="text-[12px] text-gray-500 mt-2">
                  Help shape what TLS News becomes…
                </p>
              </div>
            )}
          </div>

          {/* Re-blur button shown inside card when unblurred */}
          {showPreview && (
            <div className="flex justify-end px-5 pt-4 pb-0">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition"
              >
                <BookOpen size={12} />
                Hide preview
              </button>
            </div>
          )}

          {/* Article previews (blurred underneath) */}
          <div
            className={`p-5 space-y-5 ${!showPreview ? "select-none pointer-events-none" : ""}`}
          >
            {PREVIEW_ARTICLES.map((article, i) => (
              <div
                key={i}
                className={i > 0 ? "border-t border-[#E5E7EB] pt-5" : ""}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${article.tagColor}`}
                  >
                    {article.tag}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {article.date}
                  </span>
                </div>
                <h3 className="text-[14px] font-semibold text-gray-900 leading-snug mb-2">
                  {article.title}
                </h3>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
                  {article.excerpt}
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-amber-700 tracking-widest mb-1">
                    {article.highlight.label}
                  </p>
                  <p className="text-[12px] text-amber-900 leading-relaxed">
                    {article.highlight.text}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full ${article.avatarColor} flex items-center justify-center text-white text-[11px] font-semibold`}
                    >
                      {article.avatar}
                    </div>
                    <span className="text-[11px] text-gray-400">
                      TLS Editorial
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {article.readTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intro copy */}
        <p className="text-[14px] text-gray-600 leading-relaxed mb-1">
          We're building a smarter legal news experience tailored for lawyers
          and legal professionals.
        </p>
        <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
          <span className="font-semibold text-gray-900">Before</span> we launch
          publicly, we want to understand whether legal professionals would
          actively use a legal news experience inside The Legal Space.
        </p>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Check size={22} className="text-blue-600" />
            </div>
            <p className="text-[16px] font-medium text-gray-900 font-['Instrument_Serif'] mb-1">
              Thanks for your input!
            </p>
            <p className="text-[13px] text-gray-500">
              Your preferences will help shape what TLS News becomes.
            </p>
          </div>
        ) : (
          <>
            {/* Question 1 */}
            <div className="mb-8">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-1">
                Would you actively use legal news inside The Legal Space?
              </h2>
              <p className="text-[12px] text-gray-400 mb-4">
                Please choose all options that are relevant to you. This
                information will assist us in determining which coverage areas
                to prioritise.
              </p>
              <div className="flex flex-wrap gap-2">
                {USE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setUseChoice(opt)}
                    className={`px-4 py-2 rounded-full text-[13px] border transition ${
                      useChoice === opt
                        ? "bg-blue-700 text-white border-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="mb-8">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-1">
                What type of legal news would matter most to you?
              </h2>
              <p className="text-[12px] text-gray-400 mb-4">
                Please choose all options that are relevant to you. This
                information will assist us in determining which coverage areas
                to prioritise.
              </p>
              <div className="flex flex-wrap gap-2">
                {NEWS_TYPES.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleNews(item)}
                    className={`px-4 py-2 rounded-full text-[13px] border transition ${
                      newsChoices.includes(item)
                        ? "bg-blue-700 text-white border-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!useChoice}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-medium transition ${
                  useChoice
                    ? "bg-blue-700 text-white hover:bg-blue-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Check size={14} />
                Submit preferences
              </button>
            </div>
          </>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
