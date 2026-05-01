import Image from "next/image";

export default function Hero () {
    return (
        <section className="grid md:grid-cols-2 gap-10 pt-32.75 pl-42 pr-30 items-center">
            {/* LEFT */}
            <div>
                <p className="inline-flex items-center justify-center gap-2 bg-[#E8F0FE] text-[#1A56DB] text-sm px-4 py-1 rounded-2xl">
                    ● Verified Legal Help Across Nigeria
                </p>
                <h1 className="text-[54px] leading-15 tracking-[-0.5px] font-['Instrument_Serif'] mt-3">
                    Find <span className="text-[#1A56DB]">trusted</span> legal help,<br />
                    fast and privately
                </h1>
                <p className="font-['Geist'] text-[#6B7280] text-[16px] leading-7 font-light">
                    Describe your situation. Get matched with verified lawyers and law firms based on your practice area, location, and budget. Stay anonymous until you are ready to connect.
                </p>
                <div className="flex gap-4 mt-6">
                    <button className="bg-[#E8F0FE] text-[#1A56DB] px-4 py-2 rounded-lg">
                        I'm a Legal Professional
                    </button>

                    <button className="bg-[#1A56DB] text-white px-4 py-2 rounded-lg">
                        Get Legal Help
                    </button>
                </div>
                {/* STATS */}
                <div className="flex gap-10 mt-10 text-[12px] font-['Instrument_Serif']">
                    <div>
                        <h2 className="font-normal text-[26px]">240+</h2>
                        <p className="text-[#9CA3AF] font-['Geist'] text-[12px]">Verified Lawyers</p>
                    </div>
                    <div>
                        <h2 className="font-normal text-[26px]">80+</h2>
                        <p className="text-[#9CA3AF] font-['Geist'] text-[12px]">Law Firms</p>
                    </div>
                    <div>
                        <h2 className="font-normal text-[26px]">4.8★</h2>
                        <p className="text-[#9CA3AF] font-['Geist'] text-[12px]">Average Rating</p>
                    </div>
                    <div>
                        <h2 className="font-normal text-[26px]">4hrs</h2>
                        <p className="text-[#9CA3AF] font-['Geist'] text-[12px]">Response</p>
                    </div>
                </div>
                {/* Partnerships */}
                <div className="flex items-center gap-6 mt-10">
                    <Image
                        src="/NBA.png"
                        alt="Partnerships"
                        width={50}
                        height={50}
                    />

                    <Image
                        src="/SPAA.png"
                        alt="Partnerships"
                        width={300}
                        height={50}
                    />
                </div>
            </div>
            {/* RIGHT */}
            <div className="p-6 flex justify-center">
                <Image
                src="/lawyer.png" // put image in /public
                alt="Lawyer"
                width={500}
                height={600}
                className="rounded-xl"
                />
            </div>
            
        </section>
    )
}