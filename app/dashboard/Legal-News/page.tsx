import LegalNewsPage from '@/app/Components/Legalnewspage'
import EventsPanel from '@/app/Components/EventPanel'

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Fixed header */}
      <div className="fixed w-full top-0 z-10 bg-white border-b border-[#E6EAED]">
        <h1 className="text-[22px] font-regular text-gray-900 font-[Instrument_Serif] ps-4 pt-6 pb-4">
          Legal News
        </h1>
      </div>

      {/* Content */}
      <div className="mt-[73px] grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-0 items-start px-0 pt-4">
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