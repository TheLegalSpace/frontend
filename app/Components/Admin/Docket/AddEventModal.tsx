// app/Components/Admin/Docket/AddEventModal.tsx
// Figma source: On the Docket-6.png
"use client";

import { useState } from "react";
import { X, ImageIcon, Loader2 } from "lucide-react";
import { useCreateEvent } from "@/hooks/useEvents";
import { eventService } from "@/services/event.services";

interface Props {
  onClose: () => void;
}

export default function AddEventModal({ onClose }: Props) {
  const createEvent = useCreateEvent();
  const [eventName, setEventName] = useState("");
  const [flyer, setFlyer] = useState<File | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [link, setLink] = useState("");

  const isBusy = createEvent.isPending;

  async function handleSubmit() {
    const response = await createEvent.mutateAsync({
      title: eventName,
      description: link || eventName,
      location: "TLS Admin",
      startAt: `${startDate}T00:00:00Z`,
      endAt: `${endDate}T23:59:59Z`,
      status: "published",
      registrationUrl: link || undefined,
    });

    if (flyer && response?.data?.data?.id) {
      await eventService.uploadCover(response.data.data.id, flyer);
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-1000000000"
        onClick={!isBusy ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 z-1000000000 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 text-[13px] font-medium text-gray-700">
            Add Event
          </span>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-px bg-gray-100 mb-5" />

        <p className="text-[12px] font-semibold text-white bg-blue-600 inline-block px-2.5 py-1 rounded mb-3">
          Promotion Assets
        </p>

        <label className="block text-[12px] text-gray-500 mb-1.5">
          Name of event
        </label>
        <input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="Enter name of your event"
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-4 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />

        <label className="flex items-center gap-3 border border-gray-200 rounded-lg px-3.5 py-3 mb-5 cursor-pointer hover:bg-gray-50 transition-colors">
          <ImageIcon size={18} className="text-gray-400 shrink-0" />
          <span className="text-[13px]">
            <span className="text-blue-600 font-medium">
              {flyer ? flyer.name : "Click to upload flyer"}
            </span>
            <br />
            <span className="text-gray-400 text-[11px]">
              PNG, JPG (max. 800x400px)
            </span>
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => setFlyer(e.target.files?.[0] ?? null)}
          />
        </label>

        <p className="text-[12px] font-semibold text-white bg-blue-600 inline-block px-2.5 py-1 rounded mb-3">
          Promotion Options
        </p>
        <p className="text-[12px] text-gray-500 mb-2">
          Pick how many days you want TLS to promote your event!{" "}
          <span className="font-semibold text-gray-700">(₦1,000 a day)</span>
        </p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <p className="text-[12px] font-semibold text-white bg-blue-600 inline-block px-2.5 py-1 rounded mb-3">
          Additional Information
        </p>
        <p className="text-[12px] text-gray-500 mb-2">
          Add links for attendees: WhatsApp group, ticket page, event website,
          Linktree, registrar
        </p>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Paste a link or leave blank"
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-6 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />

        <button
          onClick={handleSubmit}
          disabled={isBusy || !eventName || !startDate || !endDate}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isBusy && <Loader2 size={15} className="animate-spin" />}
          Upload Event
        </button>
      </div>
    </div>
  );
}
