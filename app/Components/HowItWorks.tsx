"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import Image from "next/image";

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
      <div className="max-w-[1440px] mx-auto" ref={ref}>

        {/* Tabs — centered */}
        <div className="flex items-center w-full justify-center">
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
        </div>

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
            {tab === "individuals"
              ? "Simple. Seamless. Connected."
              : "Connect. Research. Grow."}
          </h2>
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

        {/* Image with button absolutely centred on top */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <Image
            src={tab === "individuals" ? "/how-it-works.png" : "/how-it-works-lawyer.png"}
            className="w-full h-auto block"
            width={1000}
            height={1000}
            alt="How it works"
          />

          {/* Button pinned to the exact centre of the image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="bg-white border border-[#E5E7EB] text-[#1A56DB] px-6 py-3 rounded-lg font-medium shadow-md hover:bg-[#1A56DB] hover:text-white hover:border-[#1A56DB] transition-colors duration-200">
              Get Started
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}