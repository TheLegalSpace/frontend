export default function HeroCTA() {
  return (
    <section className="relative min-h-125 flex items-center justify-center overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/Legal-Help-bg.jpg')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto space-y-6">
        <h2 className="text-4xl md:text-5xl font-['Instrument_Serif'] text-white leading-tight">
          Legal help shouldn&apos;t be complicated.
        </h2>

        <p className="text-gray-200 text-lg">
          Start your request in minutes. Stay anonymous. Get clarity fast.
        </p>

        <button className="px-8 py-3.5 rounded-lg border-2 border-white/30 text-white font-semibold text-sm hover:bg-white hover:text-gray-900 transition-all duration-300 backdrop-blur-sm">
          Get Legal Help Now
        </button>
      </div>
    </section>
  );
}