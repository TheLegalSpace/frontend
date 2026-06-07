import EventsPanel from '@/app/Components/EventPanel'
import LegalNewsPage from '@/app/Components/Legalnewspage'
import React from 'react'

const page = () => {
  return (
    <div className="flex h-full w-full">
      <div className="flex-1 overflow-hidden">
        <LegalNewsPage/>
      </div>
      <div className="hidden xl:block w-130 h-full border-l border-[#ECECEC] overflow-hidden">
        <EventsPanel/>
      </div>
    </div>
  )
}

export default page
