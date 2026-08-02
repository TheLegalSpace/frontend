// components/events/EventsPanel.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { usePublishedEvents } from "@/hooks/useEvents";
import { useAuth } from "../context/AuthContext";

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
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data, isLoading } = usePublishedEvents(1, 20, isAdmin);
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
    <div className="flex flex-col gap-3 xl:fixed mt-17 lg:top-2 font-[Instrument_Serif] p-4 min-h-screen border-l border-[#ECECEC] w-full max-w-108 xl:mr-2">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#1D4ED8] px-4 py-4 w-full">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-6 top-2 text-5xl text-white">✦</div>
          <div className="absolute right-16 bottom-1 text-4xl text-white">
            ✦
          </div>
        </div>
        <div className="relative z-10 font-['Geist']">
          <h2 className="text-[16px] font-[Instrument_Serif] font-medium text-white mb-1">
            On The Docket
          </h2>
          <p className="text-[12px] text-blue-100 font-[Geist]">
            Want to feature your event with The Legal Space? Request coverage,
            promotion, or partnership through{" "}
            <a
              href="/dashboard/TLS-Services"
              className="text-white underline"
            >
              events@thelegalspace.com
            </a>
          </p>
        </div>
      </div>

      {/* Event Card */}
      <div className="rounded-xl font-[Instrument_Serif] flex flex-col gap-3 items-center w-full">
        {isLoading && (
          <div className="font-['Geist'] h-48 rounded-xl bg-white flex items-center justify-center text-base text-gray-400 w-full">
            Loading events...
          </div>
        )}

        {!isLoading && activeEvent && (
          <>
            {/* Poster */}
            <div className="group relative overflow-hidden cursor-pointer w-full">
              {activeEvent.coverUrl && (
                <div className="w-full aspect-4/5 max-h-120 overflow-hidden rounded-[1.25rem] bg-[#F3F4F6]">
                  <img
                    src={activeEvent.coverUrl}
                    alt={activeEvent.title}
                    className="h-full w-full object-contain object-center block rounded-[1.25rem]"
                  />
                </div>
              )}

              {/* Darkened overlay on hover */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Name + location, slides up on hover */}
              <div className="absolute bottom-0 left-0 right-0 p-4 font-['Geist'] translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-white text-[14px] font-medium leading-snug mb-1.5 line-clamp-2">
                  {activeEvent.title}
                </h3>
                <div className="flex items-center gap-1 text-white/85 text-[11px]">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{activeEvent.location}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button className="font-['Geist'] w-full h-9 rounded-lg bg-[#ECECEC] hover:bg-[#1D4ED8] hover:text-white transition-all duration-300 text-[12px] font-medium text-[#2A2B2D] flex items-center justify-center gap-1.5">
              Register for Event
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Pagination */}
            {events.length > 1 && (
              <div className="flex items-center justify-between w-full px-2">
                <button
                  onClick={prevSlide}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>

                <div className="flex items-center gap-1">
                  {events.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        current === index
                          ? "bg-[#1D4ED8] w-4"
                          : "bg-[#D1D5DB] w-1.5"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextSlide}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition shrink-0"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </>
        )}

        {!isLoading && !events.length && (
          <div className="h-36 rounded-xl bg-white flex items-center justify-center text-xs text-gray-400 w-full">
            No upcoming events
          </div>
        )}
      </div>
    </div>
  );
}

