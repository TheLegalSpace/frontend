import EventsPanel from '@/app/Components/EventPanel';
import AppointmentForm from '@/app/Components/TLSServices/AppointmentForm';
import { BackArrow } from '@/app/Components/TLSServices/FormKit';

export const metadata = {
  title: "Build Appointment System | The Legal Space",
  description:
    "Request a proposal for a custom consultation booking system tailored to your law firm.",
};

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Fixed heading */}
      <div className="fixed top-0 left-[220px] right-0 bg-white z-10 border-b border-[#E6EAED]">
        <div className="px-6 pt-5 pb-1 flex items-center gap-2">
          <BackArrow href="/dashboard/TLS-Services" />
          <p className="text-[22px] font-regular text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Build Appointment System
          </p>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-[75px]" />

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] items-start">
        <AppointmentForm />
        <div className="min-w-0">
          <EventsPanel />
        </div>
      </div>
    </div>
  )
}