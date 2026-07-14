import LegalNewsPage from '@/app/Components/Legalnewspage'
import EventsPanel from '@/app/Components/EventPanel'

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Fixed heading */}
      <div className="fixed top-0 left-55 right-0 bg-white z-10 border-b border-[#E6EAED]">
        <div className="px-6 pt-5 pb-1">
          <p className="text-[22px] font-regular text-gray-900" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Legal News
          </p>
          <span className="block mb-4.25" />
        </div>
      </div>

      {/* Content */}
      <div className="mt-18.25 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-0 items-start px-0 pt-4">
        <div className="min-w-0">
          <LegalNewsPage />
        </div>
        <div className="min-w-0">
          <EventsPanel />
        </div>
      </div>
    </div>
  )
}