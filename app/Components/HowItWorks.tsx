// components/HowItWorks.tsx
export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Describe your situation",
      description:
        "Tell us what you need help with. We keep your identity completely private throughout.",
    },
    {
      number: "02",
      title: "Get matched instantly",
      description:
        "We surface the top verified lawyers or firms for your specific need, location, and budget.",
    },
    {
      number: "03",
      title: "Connect on your terms",
      description:
        "Chat anonymously first. Reveal your identity only when you feel comfortable.",
    },
  ];

  return (
    <section className="bg-[#F9F9F9] border border-[#E5E7EB] py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 xl:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-left mb-8 md:mb-12">
          <p className="text-[#1A56DB] text-xs uppercase tracking-wider font-medium mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-serif leading-tight">
            Legal help in three simple steps
          </h2>
          <p className="text-[#6B7280] text-base mt-2">
            Simple. Private. Effective.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white border border-[#E5E7EB] rounded-lg p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <span className="text-4xl lg:text-[42px] font-serif text-[#E5E7EB] leading-none block">
                {step.number}
              </span>
              <h3 className="text-sm lg:text-[15px] font-bold mt-4 lg:mt-6">
                {step.title}
              </h3>
              <p className="text-[#6B7280] text-sm lg:text-[13px] mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}