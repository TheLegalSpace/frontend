import Image from "next/image";

export default function Features() {
  return (
    <section className="py-15 px-42 items-center text-center">
      <div>
        <p className="text-[#1A56DB] text-[16px] uppercase font-['Geist'] mt-3">
          Features
        </p>
        <p className="text-[#0A0A0A] text-[40px] font-['Instrument_Serif'] leading-10">
          Tools to simplify finding and connecting with legal professionals.
        </p>
        <Image
          src="/mockup.png"
          alt="Features"
          width={700}
          height={300}
          className="w-full h-full object-cover rounded-3xl"
        />
        <div className="grid md:grid-cols-3 gap-10 mt-10">
          <div className="text-center">
            <Image
              src="/AI-intake.png"
              alt="AI Intake"
              width={50}
              height={50}
              className="mx-auto"
            />
            <p className="text-[#000000] text-[20px] font-['Geist'] mt-3">
              TLS AI Intake
            </p>
            <p className="text-15px text-[#6B7280] font-['Geist'] font-light">
              A smarter way to explain your problem.Our AI helps structure your
              request so lawyers understand exactly what you need.
            </p>
          </div>
          <div className="text-center">
            <Image
              src="/ghost.png"
              alt="ghost"
              width={50}
              height={50}
              className="mx-auto"
            />
            <p className="text-[#000000] text-[20px] font-['Geist'] mt-3">
              Anonymous First Contact
            </p>
            <p className="text-15px text-[#6B7280] font-['Geist'] font-light">
              No awkward calls. No exposure.You stay in control of when your
              identity is revealed.
            </p>
          </div>
          <div className="text-center">
            <Image
              src="/NBA.png"
              alt="NBA"
              width={50}
              height={50}
              className="mx-auto"
            />
            <p className="text-[#000000] text-[20px] font-['Geist'] mt-3">
              Verified Lawyers Only
            </p>
            <p className="text-15px text-[#6B7280] font-['Geist'] font-light">
              All our lawyers are vetted and hold NBA credentials, ensuring you
              choose the right legal representation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
