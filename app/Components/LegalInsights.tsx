"use client";

import { motion } from "framer-motion";

const resources = [
  {
    num: "01",
    tag: "Articles",
    title: "Insights from Legal Professionals",
    desc: "Explore expert perspectives, practical guidance, and thought leadership from legal professionals across a wide range of practice areas.",
    cta: "Explore Articles",
    preview: "article",
  },
  {
    num: "02",
    tag: "On the Docket",
    title: "Discover Opportunities to Connect",
    desc: "Stay engaged with conferences, networking events, workshops, and professional gatherings happening across the legal community.",
    cta: "View Events",
    preview: "events",
  },
  {
    num: "03",
    tag: "TLS Research",
    title: "Research Built for Legal Work",
    desc: "Conduct legal research, analyse documents, and access source backed responses designed to support more efficient legal practice.",
    cta: "Explore TLS Research",
    preview: "research",
  },
];

function ArticlePreview() {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-md">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">👤</div>
        <div>
          <p className="text-[12px] font-semibold">Chisom Azimi</p>
          <p className="text-[10px] text-gray-400">1 day ago</p>
        </div>
      </div>
      <p className="text-[12px] text-gray-600 leading-relaxed mb-3">
        Thrilled to share that I recently wrote an article for the NBA Lagos Branch Annual Conference.
        It explores the intersection of technology and criminal law...
      </p>
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-3 flex gap-2.5">
        <span className="bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded self-start mt-0.5">ARTICLE</span>
        <div>
          <p className="text-[11px] font-semibold">From Formality to Substance: The Case for Substantive Patent Examination in Nigeria</p>
          <p className="text-[10px] text-gray-400 mt-1">📅 March 29, 2026</p>
          <p className="text-[10px] text-[#1A56DB] mt-0.5">123 Reads · 📖 Read Article</p>
        </div>
      </div>
      <div className="flex gap-4 mt-3 pt-3 border-t border-[#E5E7EB]">
        <span className="text-[11px] text-gray-400">👍 1.2K</span>
        <span className="text-[11px] text-gray-400">👎 12</span>
      </div>
    </div>
  );
}

function EventsPreview() {
  return (
    <div className="bg-linear-to-br from-[#EDE9FE] to-[#E0E7FF] rounded-2xl p-5">
      <div className="flex flex-wrap gap-2 mb-4">
        {["75+ Upcoming Events", "1.2k Community Reach", "94% Engagement"].map((b) => (
          <span key={b} className="bg-white rounded-full px-3 py-1 text-[11px] font-medium shadow-sm">
            {b}
          </span>
        ))}
      </div>
      <div className="bg-[#1A56DB] rounded-xl p-4 text-white mb-3">
        <p className="text-[13px] font-semibold mb-1">On The Docket</p>
        <p className="text-[11px] opacity-85">
          Want to feature your event? Request coverage, promotion, or partnership through TLS Services.
        </p>
      </div>
      <div className="bg-gray-900 rounded-xl h-14 flex items-center justify-center text-white text-[12px] font-bold tracking-wide">
        🏛 NBA LAGOS BRANCH ANNUAL CONFERENCE 2026
      </div>
    </div>
  );
}

function ResearchPreview() {
  return (
    <div className="bg-linear-to-br from-[#FFF7ED] to-[#FEF3C7] rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[180px]">
      <div className="text-5xl mb-4">🔬</div>
      <p className="text-[14px] font-semibold text-amber-900">TLS Research Platform</p>
      <p className="text-[12px] text-amber-700 mt-1">AI-Powered Legal Research</p>
    </div>
  );
}

export default function LegalInsights() {
  return (
    <section id="resources" className="py-24 bg-white px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1A56DB] mb-3">
            RESOURCES
          </p>
          <h2 className="font-['Instrument_Serif'] text-4xl lg:text-[42px] italic tracking-tight text-gray-900">
            Everything You Need to Stay Informed and Connected
          </h2>
        </motion.div>

        {/* Resource rows */}
        <div className="space-y-24">
          {resources.map((r, i) => (
            <motion.div
              key={r.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center ${
                i % 2 === 1 ? "md:[direction:rtl]" : ""
              }`}
            >
              <div className={i % 2 === 1 ? "[direction:ltr]" : ""}>
                {r.preview === "article" && <ArticlePreview />}
                {r.preview === "events" && <EventsPreview />}
                {r.preview === "research" && <ResearchPreview />}
              </div>
              <div className={i % 2 === 1 ? "[direction:ltr]" : ""}>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[12px] text-gray-400 font-medium">{r.num}</span>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                  <span className="text-[12px] text-gray-400 font-medium">{r.tag}</span>
                </div>
                <h3 className="font-['Instrument_Serif'] text-[30px] leading-snug text-gray-900 mb-4">
                  {r.title}
                </h3>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-6">{r.desc}</p>
                <button className="px-5 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-medium text-gray-700 hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors duration-200">
                  {r.cta} →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
