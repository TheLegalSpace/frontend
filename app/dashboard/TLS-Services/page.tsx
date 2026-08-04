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
        <div className="min-w-0 border-l border-[#ECECEC] xl:min-h-screen">
          <EventsPanel />
        </div>
      </div>
    </div>
  );
}
