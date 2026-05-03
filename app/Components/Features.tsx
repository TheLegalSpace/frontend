// components/Features.tsx
import Image from "next/image";

export default function Features() {
  const features = [
    {
      icon: "/AI-intake.png",
      title: "TLS AI Intake",
      description:
        "A smarter way to explain your problem. Our AI helps structure your request so lawyers understand exactly what you need.",
    },
    {
      icon: "/ghost.png",
      title: "Anonymous First Contact",
      description:
        "No awkward calls. No exposure. You stay in control of when your identity is revealed.",
    },
    {
      icon: "/NBA.png",
      title: "Verified Lawyers Only",
      description:
        "All our lawyers are vetted and hold NBA credentials, ensuring you choose the right legal representation.",
    },
  ];

  return (
    <section className="px-4 pt-4 pb-10 md:px-8 lg:px-42 md:pt-28 lg:pt-32 md:pb-16 font-['Geist']">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <p className="text-[#1A56DB] text-sm uppercase tracking-wider font-medium mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] text-[#0A0A0A] font-['Instrument_Serif'] leading-tight max-w-3xl mx-auto">
            Tools to simplify finding and connecting with legal professionals.
          </h2>
        </div>

        {/* Mockup Image */}
        <div className="relative w-full max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="relative aspect-video">
            <Image
              src="/mockup.png"
              alt="Platform features mockup"
              fill
              className="object-cover rounded-2xl md:rounded-3xl"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature) => (
            <div key={feature.title} className="text-center px-2">
              <div className="relative w-12 h-12 mx-auto mb-4">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <h3 className="text-lg md:text-xl text-black font-medium mb-2">
                {feature.title}
              </h3>
              <p className="text-[#6B7280] text-sm md:text-[15px] leading-relaxed font-light max-w-sm mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
