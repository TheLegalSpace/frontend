// components/UseCaseSection.tsx
import { Check } from "lucide-react";
import Image from "next/image";

export default function UseCaseSection() {
  const useCases = [
    "Business registration & compliance",
    "Legal consultation for startups & SMEs",
    "Contracts & agreements",
    "Dispute prevention & pre-litigation advisory",
    "Property & real estate documentation",
    "Tax advisory & filings",
    "Employment & HR legal matters",
  ];

  return (
    <section className="font-['Geist'] relative py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-12 xl:px-16 overflow-hidden ">
      {/* Background Image using Next.js Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/Desktop.png"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">
                What can you use TLS for?
              </p>
              <h2 className="text-3xl md:text-4xl font-[Instrument_Serif] text-gray-900 leading-snug max-w-lg">
                TLS gives you direct access to trusted legal professionals for
                personal and business legal needs.
              </h2>
            </div>

            <ul className="space-y-4">
              {useCases.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center">
                    <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                  </span>
                  <span className="text-[15px]">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 rounded-lg border-2 border-blue-600 text-blue-700 text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors duration-200">
                I&apos;m a Legal Professional
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