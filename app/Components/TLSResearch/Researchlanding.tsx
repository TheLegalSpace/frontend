"use client";

import { FileText, Search } from "lucide-react";

const SUGGESTIONS = [
  "Find cases on wrongful termination",
  "Summarise this judgment",
  "Explain Section 36",
  "Research tenancy laws in Lagos",
];

const CAPABILITIES = [
  {
    iconBg: "bg-amber-100",
    iconColor: "#d97706",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d97706"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: "Case Research",
    desc: "Find cases, precedents, and legal authorities across different practice areas and jurisdictions.",
  },
  {
    iconBg: "bg-emerald-100",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#059669"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="19" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    title: "Legal Summaries",
    desc: "Break down judgments, statutes, and legal materials into easier-to-understand structured insights.",
  },
  {
    iconBg: "bg-blue-100",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Statute Exploration",
    desc: "Research laws and regulations more efficiently across Nigerian and international frameworks.",
  },
  {
    iconBg: "bg-violet-100",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Legal Questions",
    desc: "Ask legal research questions and receive grounded responses based on available and accessible sources.",
  },
  {
    iconBg: "bg-pink-100",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#db2777"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        <circle cx="12" cy="12" r="1" fill="#db2777" />
      </svg>
    ),
    title: "Citation Assistance",
    desc: "Identify related authorities, supporting references, and legal materials to strengthen your research.",
  },
  {
    iconBg: "bg-green-100",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#16a34a"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: "Document Understanding",
    desc: "Analyse uploaded legal materials and quickly surface the sections and provisions that matter most.",
  },
];

const NOT_FOR = [
  {
    iconBg: "bg-amber-100",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#d97706"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Not a Website Builder",
    desc: "TLS Research cannot design or build websites, apps, or unrelated software products. It is strictly for legal research.",
  },
  {
    iconBg: "bg-orange-100",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ea580c"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "No Fabricated Answers",
    desc: "If relevant information cannot be found, TLS Research will not generate unsupported or made-up responses.",
  },
  {
    iconBg: "bg-pink-100",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#be185d"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Not Legal Representation",
    desc: "TLS Research assists with research but does not replace professional legal judgment, advice, or representation.",
  },
  {
    iconBg: "bg-violet-100",
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6d28d9"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="19" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    title: "Source-Based Responses",
    desc: "All responses are grounded in available legal materials, documents, and accessible sources — not generated speculation.",
  },
];

interface Props {
  onSuggestion: (text: string) => void;
  onNewThread: () => void;
  onUploadAndNew: () => void;
}

export default function ResearchLanding({
  onSuggestion,
  onNewThread,
  onUploadAndNew,
}: Props) {
  return (
    <div className="flex flex-col h-full flex-1 bg-white font-['Geist']">
      {/* Sticky header */}
      <div className="shrink-0">
        <h1 className="text-[22px] font-normal text-gray-900 ps-4 pt-6 pb-px font-[Instrument_Serif]">
          TLS Research
        </h1>
        <div className="w-full h-px bg-[#E6EAED] my-4"></div>
        
        {/* Search area */}
        <div className="max-w-2xl mx-auto px-6 pt-4 pb-4 text-center border-b border-gray-100">
        {/* <h1 className="text-[18px] font-medium text-gray-900 font-['Instrument_Serif'] mb-8">
          TLS Research
        </h1> */}

        {/* Fake composer */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm mb-4 cursor-text hover:border-gray-300 transition">
          <FileText size={16} className="text-gray-400 shrink-0" />
          <span
            className="flex-1 text-left text-gray-400 text-[14px]"
            onClick={onNewThread}
          >
            Describe your legal issue or case…
          </span>
          <button
            onClick={onNewThread}
            className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center hover:bg-blue-800 transition shrink-0"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSuggestion(s)}
              className="px-3 py-1.5 border border-gray-200 rounded-full text-[12px] text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full h-px bg-[#E6EAED] my-4"></div>

        {/* Capabilities */}
        <div className=" px-4 pb-8">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-5 h-px bg-gray-300" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              Capabilities
            </p>
          </div>
          <h2 className="text-[20px] font-normal text-gray-900 font-['Instrument_Serif']">
            What TLS Research Can Help With
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            Built specifically for legal professionals and research-driven
            workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="p-5 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition"
            >
              <div
                className={`w-9 h-9 rounded-lg ${cap.iconBg} flex items-center justify-center mb-3`}
              >
                {cap.icon}
              </div>
              <p className="text-[13px] font-medium text-gray-900 mb-1">
                {cap.title}
              </p>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                {cap.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full h-px bg-[#E6EAED] my-4"></div>

      {/* Scope */}
      <div className=" px-4 pb-8">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-5 h-px bg-gray-300" />
            <p className="text-[10px] uppercase tracking-widest text-gray-400">
              Scope
            </p>
          </div>
          <h2 className="text-[20px] font-normal text-gray-900 font-['Instrument_Serif']">
            Designed For Legal Research
          </h2>
          <p className="text-[13px] text-gray-500 mt-1">
            TLS Research is focused — not general-purpose. Understanding its
            scope produces better results.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {NOT_FOR.map((item) => (
            <div
              key={item.title}
              className="p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition"
            >
              <div
                className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center mb-3`}
              >
                {item.icon}
              </div>
              <p className="text-[12px] font-semibold text-gray-800 mb-1">
                {item.title}
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full h-px bg-[#E6EAED] my-4"></div>

      {/* CTA */}
      <div className="px-4 pb-12">
        <div className="rounded-2xl research-bg  px-8 py-8 flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
              Ready
            </p>
            <h3 className="text-[22px] font-medium text-white font-['Instrument_Serif']">
              Start Researching
            </h3>
            <p className="text-[13px] text-gray-400 mt-1">
              Explore legal materials, research authorities, and work smarter
              with TLS Research.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={onNewThread}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 text-[13px] font-medium rounded-xl hover:bg-gray-100 transition whitespace-nowrap"
            >
              <Search size={14} />
              Start Research
            </button>
            <button
              onClick={onUploadAndNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-[13px] font-medium rounded-xl hover:bg-white/20 transition whitespace-nowrap"
            >
              <FileText size={14} />
              Upload Document
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
