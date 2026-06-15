"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const aboutCards = [
  {
    icon: "🎯",
    title: "Our Mission",
    desc: "To make legal support, knowledge, and professional opportunities more accessible through meaningful connections and trusted technology.",
    bg: "bg-[#F0FFF4] border-[#BBF7D0]",
  },
  {
    icon: "🚩",
    title: "Our Vision",
    desc: "To become the leading legal network where individuals, lawyers, and organisations connect, grow, and thrive.",
    bg: "bg-[#F0FDF4] border-[#BBF7D0]",
  },
  {
    icon: "🌐",
    title: "Our Purpose",
    desc: "To strengthen the legal ecosystem by empowering legal professionals and improving access to legal services for everyone.",
    bg: "bg-[#EDE9FE] border-[#DDD6FE]",
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="about" className="py-24 bg-white px-0 sm:px-4 lg:px-12 xl:p max-w-[1440px] mx-auto ">
      {/* [2fr_3fr] gives image ~40% and text ~60%, matching the screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-12 lg:gap-16 items-center">

        {/* Image side — just render naturally, border + slight rounding like screenshot */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className=""
        >
          <Image
            src="/lawyer.png"
            alt="lawyer"
            width={456}
            height={501}
            className="w-full h-auto block"
          />
        </motion.div>

        {/* Text side */}
        <div ref={ref}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-semibold tracking-widest uppercase text-[#1A56DB] mb-4"
          >
            ABOUT THE LEGAL SPACE
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="font-['Instrument_Serif'] text-4xl leading-snug tracking-tight text-gray-900 mb-6"
          >
            Building a More Connected Legal Community
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-gray-500 text-[15px] leading-relaxed mb-8"
          >
            The Legal Space is a legal network designed to bring lawyers, legal
            knowledge, professional opportunities, and the people who need them
            together in one place. We are building a trusted ecosystem where
            individuals can access legal support with confidence, and the wider
            legal community can connect, learn, and stay informed.
          </motion.p>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-3">
            {aboutCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.2 + i * 0.1 }}
                className={`rounded-2xl border p-4 ${card.bg}`}
              >
                <div className="text-xl mb-2.5">{card.icon}</div>
                <h4 className="text-[13px] font-semibold mb-1.5">{card.title}</h4>
                <p className="text-[11.5px] text-gray-500 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}