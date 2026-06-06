// components/events/EventsPanel.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import Link from "next/link";

function formatDateRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-GB", opts);
  }
  return `${start.toLocaleDateString("en-GB", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-GB", opts)}`;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsPanel() {
  const { data, isLoading } = useEvents();
  const events = data?.items || [];
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    if (!events.length) return;
    setCurrent((prev) => (prev + 1) % events.length);
  };
  const prevSlide = () => {
    if (!events.length) return;
    setCurrent((prev) => (prev - 1 + events.length) % events.length);
  };

  const activeEvent = events[current];

  return (
    <div className="flex flex-col gap-3 xl:fixed mt-[68px] lg:top-4 font-[Instrument_Serif] p-4 min-h-screen border-l border-[#ECECEC]">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#1D4ED8] px-4 py-7">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-6 top-2 text-5xl text-white">✦</div>
          <div className="absolute right-16 bottom-1 text-4xl text-white">
            ✦
          </div>
        </div>
        <div className="relative z-10 font-['Geist']">
          <h2 className="text-[16px] font-[Instrument_Serif] font-medium text-white mb-1 ">
            On The Docket
          </h2>
          <p className="text-[12px] text-blue-100 font-[Geist]">
            Want to feature your event with The Legal Space? Request coverage,
            promotion, or partnership through{" "}
            <Link
              href="dashboard/tls-services"
              className="text-white underline"
            >
              TLS Services
            </Link>
            .{" "}
          </p>
          {/* <a
            href="mailto:events@thelegalspace.com"
            className="text-[12px] text-white underline underline-offset-2"
          >
            event@thelegalspace.com
          </a> */}
        </div>
      </div>
      <div className="bg-[#E6EAED] h-px w-full"></div>

      {/* Event Card */}
      <div className=" rounded-xl  font-[Instrument_Serif] flex flex-col gap-2 items-center ">
        {isLoading && (
          <div className="font-[Instrument_Serif] h-48 rounded-xl bg-white flex items-center justify-center text-xs text-gray-400">
            Loading events...
          </div>
        )}

        {!isLoading && activeEvent && (
          <>
            {/* Poster */}
            <div className="relative overflow-hidden rounded-xl bg-white">
              {activeEvent.coverUrl && (
                <img
                  src={activeEvent.coverUrl}
                  alt={activeEvent.title}
                  className="w-full h-[50%] object-cover"
                />
              )}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-3">
                {/* <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="host"
                    className="w-full h-full object-cover"
                  />
                </div> */}
              </div>
            </div>

            {/* CTA */}
            <button className="font-['Geist'] w-[60%] mt-2.5 h-9 rounded-lg bg-[#ECECEC] hover:bg-[#1D4ED8] hover:text-white transition-all duration-300 text-[12px] font-medium text-[#2A2B2D] flex items-center justify-center gap-1.5">
              Register for Event
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Info */}
            {/* <div className="mt-3 px-1 font-['Geist']">
              span className="inline-flex px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56] border border-[#5DCAA5] text-[10px] mb-2">
                {activeEvent.status}
              </span> 
              <h3 className="text-[13px] font-medium leading-snug text-[#111827] mb-1.5">
                {activeEvent.title}
              </h3>
              <div className="flex flex-col gap-1 text-[11px] text-gray-500">
                <p>{activeEvent.location}</p>
                <p>{formatDateRange(activeEvent.startAt, activeEvent.endAt)}</p>
                <p>{formatTime(activeEvent.startAt)}</p>
              </div>
            </div> */}

            {/* Pagination */}
            {events.length > 1 && (
              <div className="flex items-center justify-center gap-5 mt-4">
                <button
                  onClick={prevSlide}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-700" />
                </button>

                <div className="flex items-center gap-1.5">
                  {events.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        current === index
                          ? "bg-[#1D4ED8] w-4"
                          : "bg-[#D1D5DB] w-1.5"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-gray-700" />
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && !events.length && (
          <div className="h-36 rounded-xl bg-white flex items-center justify-center text-xs text-gray-400">
            No upcoming events
          </div>
        )}
      </div>
    </div>
  );
}
