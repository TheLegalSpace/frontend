"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import Image from "next/image";
import { MoveRight } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleLandingNav = (type: "individuals" | "lawyers") => {
    if (type === "individuals") {
      localStorage.setItem("loginType", "user");
      router.push("/signin");
    } else {
      localStorage.setItem("loginType", "lawyer");
      router.push("/signin");
    }
  };
  return (
    <section className="bg-[#F9F9F9] border border-[#E5E7EB] px-4 pt-4 pb-10 md:px-8 lg:px-42 md:pt-28 lg:pt-32 md:pb-16 font-['Geist']">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-left mb-8 md:mb-12">
          <p className="text-[#1A56DB] text-xs uppercase tracking-wider font-medium mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-['Instrument_Serif'] leading-tight">
            Legal help in three simple steps
          </h2>
          <p className="text-[#6B7280] text-base mt-2">
            Simple. Private. Effective.
          </p>
        </div>

          {/* Button pinned to the exact centre of the image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="text-[12px] md:text-[14px] flex items-center gap-2 bg-white border border-[#E5E7EB] text-[#000000] px-6 py-3 rounded-lg font-dmSans shadow-md hover:bg-[#1A56DB] hover:text-white hover:border-[#1A56DB] transition-colors duration-200"
              onClick={() => handleLandingNav(tab)}
            >
              {tab === "individuals" ? (
                "Login to find a lawyer today!"
              ) : (
                <>
                  Create a profile today! <MoveRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}