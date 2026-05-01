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
    ]
    return (
        <section className="bg-[#e8f0fe] py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                    <div className="space-y-4">
                    <p className="text-xs font-semibold tracking-[0.2em] text-blue-700 uppercase">
                        What can you use TLS for?
                    </p>
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 leading-snug max-w-lg">
                        TLS gives you direct access to trusted legal professionals for
                        personal and business legal needs.
                    </h2>
                    </div>

                    <ul className="space-y-4">
                    {useCases.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-gray-700">
                        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-blue-600/10 flex items-center justify-center">
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
                    <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors duration-200">
                        Get Legal Help
                    </button>
                    </div>
                </div>

                {/* Right Image */}
                <div className="relative hidden lg:block">
                    <Image
                    src="/images/person-pointing.png"
                    alt="Professional showcasing TLS features"
                    width={600}
                    height={700}
                    className="object-contain w-full h-auto"
                    priority
                    />
                </div>
                </div>
            </div>
        </section>
    )
}