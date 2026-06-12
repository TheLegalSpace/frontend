"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HeroCTA() {
  const router = useRouter();

  const loginType = (type: "lawyer" | "user") => {
    localStorage.setItem("loginType", type);
    router.push("/signin");
  };

  return (
    <section id="cta" className="bg-[#D6E4F7] overflow-hidden relative px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-end min-h-[480px]">

        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="py-20"
        >
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#1A56DB] mb-4">
            READY TO GET STARTED?
          </p>
          <h2 className="font-['Instrument_Serif'] text-5xl lg:text-[52px] leading-tight tracking-tight text-gray-900 mb-5">
            Join a Growing Legal <br />
            <em className="text-[#1A56DB]">Community</em>
          </h2>
          <p className="text-gray-600 text-[15px] leading-relaxed max-w-md mb-8">
            Whether you&apos;re seeking legal support, looking to grow your practice, or exploring
            valuable legal resources, The Legal Space brings everything together in one trusted network.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => loginType("lawyer")}
              className="px-5 py-2.5 border border-gray-300 bg-white text-gray-800 rounded-xl text-sm font-medium hover:border-[#1A56DB] transition-all"
            >
              Join as a Lawyer
            </button>
            <button
              onClick={() => loginType("user")}
              className="px-5 py-2.5 bg-[#1A56DB] text-white rounded-xl text-sm font-medium hover:bg-[#1648b8] transition-colors shadow-sm"
            >
              Find a lawyer
            </button>
          </div>
        </motion.div>

        {/* Right — decorative people */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden md:flex items-end justify-center gap-6 h-full pt-12"
        >
          <div
            className="text-[160px] leading-none select-none"
            style={{ filter: "drop-shadow(0 -4px 16px rgba(0,0,0,0.08))" }}
          >
            👩🏿‍💼
          </div>
          <div
            className="text-[140px] leading-none select-none self-end"
            style={{ filter: "drop-shadow(0 -4px 16px rgba(0,0,0,0.08))" }}
          >
            👨‍💼
          </div>
        </motion.div>
      </div>
    </section>
  );
}
