"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";

const individualsSteps = [
  {
    num: "01",
    title: "Describe your situation",
    desc: "Tell us what you need help with. We keep your identity completely private throughout.",
  },
  {
    num: "02",
    title: "Discover the Right Connections",
    desc: "Explore verified legal professionals, relevant resources, and opportunities tailored to your needs.",
  },
  {
    num: "03",
    title: "Connect with Confidence",
    desc: "Chat anonymously with your lawyer. Reveal identity when comfortable.",
  },
];

const lawyersSteps = [
  {
    num: "01",
    title: "Create Your Presence",
    desc: "Build a professional profile and showcase your expertise to the legal community.",
  },
  {
    num: "02",
    title: "Expand Your Reach",
    desc: "Increase your visibility, publish insights, and connect with potential clients and opportunities.",
  },
  {
    num: "03",
    title: "Grow Through Connection",
    desc: "Leverage tools, resources, and professional opportunities designed to support long term growth.",
  },
];

export default function HowItWorks() {
  const [tab, setTab] = useState<"individuals" | "lawyers">("individuals");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const steps = tab === "individuals" ? individualsSteps : lawyersSteps;

  return (
    <section id="how-it-works" className="py-24 bg-[#F9FAFB] px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1A56DB] mb-3">
            HOW IT WORKS
          </p>
          <h2 className="font-['Instrument_Serif'] text-4xl lg:text-[40px] tracking-tight text-gray-900 italic">
            Simple. Seamless. Connected.
          </h2>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit mb-12"
        >
          {(["individuals", "lawyers"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                tab === t ? "text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-gray-900 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 capitalize">
                For {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Step cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <span className="font-['Instrument_Serif'] text-5xl text-[#E5E7EB] leading-none block mb-5">
                  {step.num}
                </span>
                <h3 className="text-[15px] font-semibold mb-2.5">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* App mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-lg"
        >
          {/* Bar */}
          <div className="bg-[#F3F4F6] border-b border-[#E5E7EB] px-4 py-2.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            <span className="flex-1 bg-white border border-[#E5E7EB] rounded-md px-3 py-1 text-xs text-gray-400 mx-3 max-w-xs">
              thelegalspace.com
            </span>
          </div>
          {/* Body */}
          <div className="grid grid-cols-[180px_1fr_240px] min-h-[240px]">
            {/* Sidebar */}
            <div className="border-r border-[#E5E7EB] p-4">
              <p className="text-[10px] font-bold tracking-widest mb-3">THE LEGAL SPACE</p>
              {["👤 Profile", "📋 Feeds", "🔗 Leads", "💬 Messages", "📝 Posts"].map((item, i) => (
                <div
                  key={item}
                  className={`text-[11px] px-2 py-1.5 rounded-lg mb-0.5 ${
                    i === 1 ? "bg-[#E8F0FE] text-[#1A56DB] font-medium" : "text-gray-400"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            {/* Feed */}
            <div className="p-4 border-r border-[#E5E7EB]">
              <div className="flex gap-2 mb-4">
                {["All", "Top Firms", "Top Lawyers", "Articles"].map((f, i) => (
                  <button
                    key={f}
                    className={`text-[11px] px-3 py-1 rounded-md border ${
                      i === 0
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-400 border-[#E5E7EB]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs">
                  👤
                </div>
                <div>
                  <p className="text-[11px] font-semibold">
                    Chisom Azimi <span className="font-normal text-gray-400">· 1 day ago</span>
                  </p>
                  <p className="text-[11px] text-gray-600 leading-relaxed mt-1">
                    Thrilled to share that I recently wrote an article for the NBA Lagos Branch Annual
                    Conference. It explores the intersection of technology and criminal law...
                  </p>
                  <div className="mt-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-2 flex gap-2">
                    <span className="bg-gray-900 text-white text-[9px] font-bold px-2 py-0.5 rounded self-start">
                      ARTICLE
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold leading-tight">
                        From Formality to Substance: Patent Examination in Nigeria
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">📅 March 29, 2026</p>
                      <p className="text-[10px] text-[#1A56DB] mt-0.5">123 Reads</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right panel */}
            <div className="p-4">
              <div className="bg-[#1A56DB] rounded-xl p-3 text-white mb-3">
                <p className="text-[11px] font-semibold mb-1">On The Docket</p>
                <p className="text-[10px] opacity-85 leading-relaxed">
                  Want to feature your event? Request coverage, promotion, or partnership through TLS Services.
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl h-16 flex items-center justify-center text-white text-[11px] font-bold">
                🏛 NBA LAGOS 2026
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
