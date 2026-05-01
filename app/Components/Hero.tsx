// components/Hero.tsx
import Image from "next/image";

export default function Hero() {
  return (
    <section className="px-4 pt-4 pb-10 md:px-8 lg:px-42 md:pt-28 lg:pt-32 md:pb-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT */}
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 bg-[#E8F0FE] text-[#1A56DB] text-sm px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB]" />
            Verified Legal Help Across Nigeria
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-[54px] leading-tight lg:leading-15 tracking-tight font-serif">
            Find <span className="text-[#1A56DB]">trusted</span> legal help,
            <br className="hidden md:block" /> fast and privately
          </h1>

          <p className="text-[#6B7280] text-base leading-relaxed max-w-lg">
            Describe your situation. Get matched with verified lawyers and law firms 
            based on your practice area, location, and budget. Stay anonymous until 
            you are ready to connect.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-[#E8F0FE] text-[#1A56DB] px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#d1e3fc] transition-colors">
              I&apos;m a Legal Professional
            </button>
            <button className="bg-[#1A56DB] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#1648b8] transition-colors">
              Get Legal Help
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
            {[
              { value: "240+", label: "Verified Lawyers" },
              { value: "80+", label: "Law Firms" },
              { value: "4.8★", label: "Average Rating" },
              { value: "4hrs", label: "Response" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl lg:text-[26px] font-serif">{stat.value}</p>
                <p className="text-[#9CA3AF] text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Partnerships */}
          <div className="flex items-center gap-6 pt-4">
            <Image
              src="/NBA.png"
              alt="Nigerian Bar Association"
              width={50}
              height={50}
              className="h-8 w-auto object-contain"
            />
            <Image
              src="/SPAA.png"
              alt="SPAA Partnership"
              width={300}
              height={50}
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex justify-center md:justify-end">
          <Image
            src="/lawyer.png"
            alt="Professional lawyer"
            width={500}
            height={600}
            className="rounded-xl w-full max-w-md md:max-w-none h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}