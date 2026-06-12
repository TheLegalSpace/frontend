"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const individualsTestimonials = [
  {
    text: "I kept putting off finding a lawyer for ages because I had no clue where to begin. But in just two days, I got three great replies and picked someone I really trusted.",
    author: "The Legal Space User",
    avatar: "👤",
    featured: false,
  },
  {
    text: "Everything was clear and there were no hidden costs to simply find help. It felt built for ordinary people, not just corporations.",
    author: "The Legal Space User",
    avatar: "👩",
    featured: true,
  },
  {
    text: "Checking out the articles beforehand helped me walk into my consultation knowing what to expect. It really took the pressure off!",
    author: "The Legal Space User",
    avatar: "👩🏽",
    featured: false,
  },
];

const lawyersTestimonials = [
  {
    text: "The platform gives you a cool space to show off your skills, connect with others in the legal world, and really boost your visibility.",
    author: "Law Firm Representative",
    avatar: "👨🏿‍💼",
    featured: false,
  },
  {
    text: "The Legal Space has helped increase my visibility and connect me with opportunities that align with my area of practice.",
    author: "Verified Legal Professional",
    avatar: "👨🏾‍💼",
    featured: true,
  },
  {
    text: "Access to resources, professional opportunities, and a wider audience has made The Legal Space a valuable part of my practice.",
    author: "Legal Professional",
    avatar: "👨🏿‍💼",
    featured: false,
  },
];

export default function UseCaseSection() {
  const [tab, setTab] = useState<"individuals" | "lawyers">("individuals");
  const testimonials = tab === "individuals" ? individualsTestimonials : lawyersTestimonials;

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-[#EEF2FF] to-[#F0F9FF] px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1A56DB] mb-3">
            TESTIMONIALS
          </p>
          <h2 className="font-['Instrument_Serif'] text-4xl tracking-tight text-gray-900 mb-6">
            What People Are Saying
          </h2>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit mx-auto">
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
                    layoutId="testi-tab-bg"
                    className="absolute inset-0 bg-gray-900 rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">
                  For {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`bg-white rounded-2xl p-7 border border-black/4 ${
                  t.featured
                    ? "shadow-xl shadow-black/8 scale-[1.03] z-10 relative"
                    : "shadow-md shadow-black/4"
                }`}
              >
                <div className="text-[#F59E0B] text-xl tracking-wide mb-4">★★★★★</div>
                <p className="text-[15px] text-gray-800 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base">
                    {t.avatar}
                  </div>
                  <span className="text-[14px] font-medium text-gray-700">{t.author}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Social CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-14"
        >
          <button className="bg-[#1A56DB] text-white px-7 py-3 rounded-xl text-sm font-medium hover:bg-[#1648b8] transition-colors shadow-md">
            Follow us on Social Media
          </button>
        </motion.div>
      </div>
    </section>
  );
}
