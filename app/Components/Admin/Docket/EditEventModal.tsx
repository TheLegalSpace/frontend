// app/Components/Admin/Docket/EditEventModal.tsx
"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useUpdateEvent } from "@/hooks/useAdmin";
import type { AdminEventListItem } from "@/services/admin.services";

interface Props {
  event: AdminEventListItem;
  onClose: () => void;
}

const STATUS_CHOICES: { label: string; value: "draft" | "published" | "past" }[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Past", value: "past" },
];

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return iso.slice(0, 10); // YYYY-MM-DD for <input type="date">
}

export default function EditEventModal({ event, onClose }: Props) {
  const updateEvent = useUpdateEvent();

  const [title, setTitle] = useState(event.title ?? "");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState(toDateInputValue(event.startAt));
  const [endAt, setEndAt] = useState(toDateInputValue(event.endAt));
  const [registrationUrl, setRegistrationUrl] = useState(event.registrationUrl ?? "");
  const [status, setStatus] = useState<"draft" | "published" | "past">(
    event.status === "published" || event.status === "past" ? event.status : "draft",
  );
  const [error, setError] = useState<string | null>(null);

  const isBusy = updateEvent.isPending;

  async function handleSave() {
    setError(null);
    try {
      await updateEvent.mutateAsync({
        eventId: event.id,
        payload: {
          title: title || undefined,
          description: description || undefined,
          location: location || undefined,
          startAt: startAt ? `${startAt}T00:00:00.000Z` : undefined,
          endAt: endAt ? `${endAt}T23:59:59.000Z` : undefined,
          registrationUrl: registrationUrl || undefined,
          status,
        },
      });
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Couldn't save changes. Please try again.",
      );
    }
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
            Edit Event
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

        {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}

        <label className="block text-[12px] text-gray-500 mb-1.5">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-4 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />

        <label className="block text-[12px] text-gray-500 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Leave blank to keep unchanged"
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-4 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
        />

        <label className="block text-[12px] text-gray-500 mb-1.5">Location</label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Leave blank to keep unchanged"
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-4 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />

        <label className="block text-[12px] text-gray-500 mb-1.5">Dates</label>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <input
            type="date"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
          <input
            type="date"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <label className="block text-[12px] text-gray-500 mb-1.5">Registration Link</label>
        <input
          value={registrationUrl}
          onChange={(e) => setRegistrationUrl(e.target.value)}
          placeholder="Leave blank to keep unchanged"
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] mb-4 focus:outline-none focus:ring-1 focus:ring-gray-300"
        />

        <label className="block text-[12px] text-gray-500 mb-1.5">Status</label>
        <div className="flex gap-2 mb-6">
          {STATUS_CHOICES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatus(s.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-[13px] font-medium border transition-colors ${
                status === s.value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={isBusy || !title}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isBusy && <Loader2 size={15} className="animate-spin" />}
          {isBusy ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}