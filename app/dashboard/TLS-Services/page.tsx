import EventsPanel from "@/app/Components/EventPanel";
import ServicePage from "../../Components/TLSServices/ServicePage";

export const metadata = {
  title: "Services | The Legal Space",
  description:
    "Explore TLS services built for law firms — from legal website design and appointment systems to custom productivity tools, tech consulting, and event promotion.",
};

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Fixed heading */}
      <div className="fixed top-0 left-55 right-0 bg-white z-10 border-b border-[#E6EAED]">
        <div className="px-6 pt-5 pb-1">
          <p
            className="text-[22px] font-regular text-gray-900"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            TLS Services
          </p>
          <span className="block mb-4.25" />
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-18.75" />

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] items-start">
        <ServicePage />
        {/* Right column spacer — keeps grid space on xl, renders EventsPanel on mobile */}
        <div className="min-w-0 border-l border-[#ECECEC] min-h-screen xl:invisible">
          <EventsPanel />
        </div>
      </div>

      {/* Fixed EventsPanel on desktop — immune to ancestor overflow changes */}
      <div
        className="hidden xl:block fixed top-18.75 border-l border-[#ECECEC] bg-white"
        style={{
          right: 0,
          width: "calc((100vw - 220px) * 0.4)",
          height: "calc(100vh - 75px)",
          overflowY: "auto",
        }}
      >
        <EventsPanel />
      </div>
    </div>
  );
}
