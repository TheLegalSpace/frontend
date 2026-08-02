import EventsPanel from '@/app/Components/EventPanel';
import EventPromotionForm from '@/app/Components/TLSServices/EventPromotionForm';
import { BackArrow } from '@/app/Components/TLSServices/FormKit';

export const metadata = {
  title: "Legal Event Promotion | The Legal Space",
  description:
    "Promote your conference, webinar, legal summit, or networking event to The Legal Space audience.",
};

export default function Page() {
  return (
    <div className="min-h-screen">
      {/* Fixed heading */}
      <div className="fixed top-0 left-55 right-0 bg-white z-10 border-b border-[#E6EAED]">
        <div className="px-6 pt-5 pb-5.25 flex items-center gap-2">
          <BackArrow href="/dashboard/TLS-Services" />
          <p className="text-[22px] font-regular text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Legal Event Promotion
          </p>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-18.75" />

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] items-start">
        <EventPromotionForm />
        <div className="min-w-0">
          <EventsPanel />
        </div>
      </div>
    </div>
  )
}