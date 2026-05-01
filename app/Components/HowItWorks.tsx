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
    ]
    return (
        <section className="bg-[#F9F9F9] border border-[#E5E7EB] py-15 px-42">
            <div className="text-left">
                <p className="text-[#1A56DB] text-[12px] uppercase font-['Geist'] mt-3">How it works</p>
                <p className="text-[40px] font-['Instrument_Serif']">Legal help in three simple steps</p>
                <p className="text-[#6B7280] text-[16px] font-['Geist'] mt-1">Simple. Private. Effective.</p>
            </div>
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-4">
                {steps.map((step) => (
                    <div
                    key={step.number}
                    className="bg-white border border-[#E5E7EB] rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <span className="text-[42px] font-['Instrument_Serif'] text-[#E5E7EB] leading-10.5">{step.number}</span>
                        <h3 className="text-[15px] font-['Geist'] mt-4 font-bold">{step.title}</h3>
                        <p className="text-[#6B7280] text-[13px] font-['Geist'] mt-2">{step.description}</p>    
                    </div>
                ))}
            </div>
        </section>
    )   
}