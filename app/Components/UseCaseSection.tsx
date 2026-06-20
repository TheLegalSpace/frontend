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

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div
      className={`
        bg-white
        rounded-[32px]
        border border-[#E9EBF1]
        p-8
        transition-all
        duration-300 font-dmSans flex flex-col justify-between
        ${
          testimonial.featured
            ? "min-h-[340px] shadow-[0_20px_80px_rgba(0,0,0,0.08)]"
            : "min-h-[254px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }
      `}
    >
      <div className="flex flex-col">
        <div className="text-[#F5B400] text-xl mb-6 tracking-wide">★★★★★</div>

        <p
          className={`text-[#262626] text-[12px] ${testimonial.featured ? " leading-8" : "mb-5 leading-6"}`}
        >
          {testimonial.text}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#F3F4F6] flex items-center justify-center">
          {testimonial.avatar}
        </div>

        <span className="text-[14px] font-medium text-[#262626]">
          {testimonial.author}
        </span>
      </div>
    </div>
  );
}

function TestimonialShowcase({
  testimonials,
  mirrored = false,
}: {
  testimonials: Testimonial[];
  mirrored?: boolean;
}) {
  return (
    <div
      className={`
        relative
        flex
        justify-center
        items-start px-5
        ${mirrored ? "scale-y-[-1]" : ""}
      `}
    >
      {/* MOBILE LEFT PEEK */}
      <div
        className="
          md:hidden
          absolute
          left-[-72%]
          top-4
          w-[85%]
          opacity-60
        "
      >
        <TestimonialCard testimonial={testimonials[0]} />
      </div>

      {/* DESKTOP LEFT */}
      <div
        className="
          hidden
          md:block
          w-[286px]
          shrink-0
          translate-y-8
        "
      >
        <TestimonialCard testimonial={testimonials[0]} />
      </div>

      {/* CENTER */}
      <div
        className="
          relative
          z-20
          w-full
          max-w-[360px]
          mx-4
        "
      >
        <TestimonialCard
          testimonial={{
            ...testimonials[1],
            featured: true,
          }}
        />
      </div>

      {/* DESKTOP RIGHT */}
      <div
        className="
          hidden
          md:block
          w-[286px]
          shrink-0
          translate-y-8
        "
      >
        <TestimonialCard testimonial={testimonials[2]} />
      </div>

      {/* MOBILE RIGHT PEEK */}
      <div
        className="
          md:hidden
          absolute
          right-[-72%]
          top-4
          w-[85%]
          opacity-60
        "
      >
        <TestimonialCard testimonial={testimonials[2]} />
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [tab, setTab] = useState<"individuals" | "lawyers">("individuals");

  const testimonials =
    tab === "individuals" ? individualsTestimonials : lawyersTestimonials;

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden py-24"
      style={{
        backgroundImage: "url('/testimonial-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[11px] tracking-[0.25em] font-semibold text-[#1A56DB] mb-3">
            TESTIMONIALS
          </p>

          {/* <h2 className="font-['Instrument_Serif'] text-5xl text-[#111827] mb-6">
            What People Are Saying
          </h2> */}

          <div className="flex gap-1 bg-white border border-[#E5E7EB] rounded-xl p-1 w-fit mx-auto">
            {(["individuals", "lawyers"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`relative px-5 py-2 rounded-lg text-sm font-medium ${
                  tab === item
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-700"
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
                  For {item.charAt(0).toUpperCase() + item.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* SHOWCASE */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <TestimonialShowcase testimonials={testimonials} />
            </motion.div>
          </AnimatePresence>

          {/* REFLECTION */}
          <div
            className="
              mt-10
              pointer-events-none
              opacity-40
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
                className="blur-[1.5px]"
              >
                <TestimonialShowcase testimonials={testimonials} mirrored />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* REFLECTION FADE */}
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-[400px]
              // bg-linear-to-b
              // from-transparent
              // via-white/10
              // to-transparent
              pointer-events-none
            "
          />

          {/* CTA BUTTON */}
          <div
            className="
              absolute
              left-1/2
              bottom-[90px]
              -translate-x-1/2
             "
          >
            <button
              className="
                bg-[#1A56DB]
                text-white
                px-8
                py-4
                rounded-full
                text-sm
                font-medium
                shadow-xl z-50
                hover:bg-[#184BC2]
                transition-colors
              "
            >
              Follow us on Social Media
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
