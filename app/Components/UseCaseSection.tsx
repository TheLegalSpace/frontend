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

type Testimonial = {
  text: string;
  author: string;
  avatar: string;
  featured: boolean;
};

function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <div
      className={`bg-white rounded-3xl p-7 border border-[#EAEAEA] transition-all duration-300 ${
        testimonial.featured
          ? "shadow-[0_20px_60px_rgba(0,0,0,0.08)] scale-[1.04] relative z-10"
          : "shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      }`}
    >
      <div className="text-[#F5B400] text-lg mb-5">★★★★★</div>

      <p className="text-[#262626] text-[15px] leading-8 mb-8">
        {testimonial.text}
      </p>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center">
          {testimonial.avatar}
        </div>

        <span className="text-[15px] text-[#262626] font-medium">
          {testimonial.author}
        </span>
      </div>
    </div>
  );
}

function TestimonialGrid({
  testimonials,
  mirrored = false,
}: {
  testimonials: Testimonial[];
  mirrored?: boolean;
}) {
  return (
    <div
      className={`grid md:grid-cols-3 gap-6 ${
        mirrored ? "scale-y-[-1]" : ""
      }`}
    >
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: mirrored ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: index * 0.08,
          }}
        >
          <TestimonialCard testimonial={testimonial} />
        </motion.div>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [tab, setTab] = useState<"individuals" | "lawyers">(
    "individuals"
  );

  const testimonials =
    tab === "individuals"
      ? individualsTestimonials
      : lawyersTestimonials;

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-24 px-4 sm:px-8 lg:px-16"
      style={{
        backgroundImage: "url('/testimonial-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[11px] tracking-[0.25em] font-semibold text-[#1A56DB] mb-3">
            TESTIMONIALS
          </p>

          <h2 className="font-['Instrument_Serif'] text-5xl mb-6">
            What People Are Saying
          </h2>

          <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit mx-auto">
            {(["individuals", "lawyers"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`relative px-5 py-2 rounded-lg text-sm font-medium ${
                  tab === item
                    ? "text-white"
                    : "text-gray-500"
                }`}
              >
                {tab === item && (
                  <motion.span
                    layoutId="tab-bg"
                    className="absolute inset-0 bg-[#111827] rounded-lg"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                <span className="relative z-10">
                  For{" "}
                  {item.charAt(0).toUpperCase() +
                    item.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards + Reflection */}
        <div className="relative">
          {/* MAIN CARDS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <TestimonialGrid testimonials={testimonials} />
            </motion.div>
          </AnimatePresence>

          {/* REFLECTION */}
          <div
            className="
              mt-8
              pointer-events-none
              opacity-70
              overflow-hidden
              mask-[linear-gradient(to_bottom,black,transparent)]
              [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)]
            "
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`reflection-${tab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="blur-[0.15px]"
              >
                <TestimonialGrid
                  testimonials={testimonials}
                  mirrored
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* White fade like the design */}
          {/* <div
            className="
              absolute
              left-0
              right-0
              bottom-0
              h-[300px]
              bg-gradient-to-b
              from-transparent
              via-white/70
              to-white
              pointer-events-none
            "
          /> */}
        </div>

        {/* CTA */}
        <div className="text-center mt-[-5%]">
          <button
            className="
              bg-[#1A56DB]
              text-white
              px-8
              py-3
              mt-[-50%]
              rounded-full
              shadow-lg
              hover:bg-[#184BC2]
              transition-colors
            "
          >
            Follow us on Social Media
          </button>
        </div>
      </div>
    </section>
  );
}