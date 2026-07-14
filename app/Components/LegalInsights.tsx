"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const resources = [
  {
    num: "01",
    tag: "Articles",
    title: "Insights from Legal Professionals",
    desc: "Explore expert perspectives, practical guidance, and thought leadership from legal professionals across a wide range of practice areas.",
    cta: "Explore Articles",
    preview: "article",
    action: "lawyer",
  },
  {
    num: "02",
    tag: "On the Docket",
    title: "Discover Opportunities to Connect",
    desc: "Stay engaged with conferences, networking events, workshops, and professional gatherings happening across the legal community.",
    cta: "View Events",
    preview: "events",
    action: "lawyer",
  },
  {
    num: "03",
    tag: "TLS Research",
    title: "Research Built for Legal Work",
    desc: "Conduct legal research, analyse documents, and access source backed responses designed to support more efficient legal practice.",
    cta: "Explore TLS Research",
    preview: "research",
    action: "user",
  },
  {
    num: "04",
    tag: "Legal News",
    title: "Help Shape What's Next",
    desc: "We're exploring a dedicated legal news experience and would love your input. Tell us if legal news is something you'd actively use on The Legal Space.",
    cta: "Take Survey 🥺",
    preview: "news",
    action: "user",
  },
] as const;

const previews: Record<string, string> = {
  article: "/chisom-article-image.png",
  events: "/feature.png",
  research: "/research.png",
  news: "/news.png",
};

export default function LegalInsights() {
  const router = useRouter();

  const usePathName = usePathname();

  const loginType = (type: "lawyer" | "user") => {
    localStorage.setItem("loginType", type);
    if (usePathName === "/signin") {
      window.location.reload();
      return;
    }
    router.replace("/signin");
  };
  return (
    <section id="resources" className="py-24 bg-white px-4 sm:px-8 lg:px-16">
      <div className="max-w-360 mx-auto">
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
        <div className="space-y-16">
          {resources.map((r, i) => {
            const isEven = i % 2 === 1;
            return (
              <motion.div
                key={r.num}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.05 }}
                /* image is ~62%, text is ~38% */
                className={`flex flex-col ${
                  isEven ? "md:flex-row-reverse" : "md:flex-row"
                } items-center gap-0`}
              >
                {/* ── IMAGE — takes 62% ── */}
                <div className="w-full md:w-[62%] shrink-0">
                  <Image
                    src={previews[r.preview]}
                    alt={r.tag}
                    width={1000}
                    height={600}
                    className="w-full h-auto object-cover block"
                  />
                </div>

                {/* ── TEXT — takes remaining 38%, padded inward ── */}
                <div
                  className={`w-full md:w-[38%] shrink-0 ${
                    isEven
                      ? "md:pr-12 lg:pr-20 py-8 md:py-0"
                      : "md:pl-12 lg:pl-20 py-8 md:py-0"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[12px] text-black font-medium">
                      {r.num}
                    </span>
                    <div className="h-px w-8 bg-black" />
                    <span className="text-[12px] text-black font-medium">
                      {r.tag}
                    </span>
                  </div>

                  <h3 className="font-['Instrument_Serif'] text-[24px] leading-snug text-gray-900 mb-4">
                    {r.title}
                  </h3>

                  <p className="text-black text-[13px] leading-relaxed font-light mb-7">
                    {r.desc}
                  </p>

                  <button onClick={() => {
                    loginType(r.action);
                  }}
                  className="px-5 py-2.5 border border-[#E5E7EB] rounded-full text-sm font-medium text-gray-700 hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors duration-200"
                >
                  {r.cta} →
                </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
