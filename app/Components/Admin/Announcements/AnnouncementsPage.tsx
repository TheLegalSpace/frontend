// app/Components/Admin/Announcements/AnnouncementsPage.tsx
// Figma source: Announcements.png
"use client";

import { useState } from "react";
import { Loader2, Mail, Megaphone, Plus, X } from "lucide-react";
import AdminPageHeader from "../shared/AdminPageHeader";
import { formatDate } from "../shared/format";
import {
  useCreateAnnouncement,
  useEmailTemplates,
  usePlatformAnnouncements,
} from "@/hooks/useAdmin";

function EmailTemplatesModal({ onClose }: { onClose: () => void }) {
  const { data: templates, isLoading } = useEmailTemplates();
  return (
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-gray-900">
            Email Templates
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading templates...
          </div>
        ) : !templates?.length ? (
          <p className="text-center text-[13px] text-gray-400 py-12">
            No email templates yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-[13px] font-medium text-gray-900">
                    {t.name}
                  </p>
                  <p className="text-[12px] text-gray-400">{t.subject}</p>
                </div>
                <span className="text-[11px] text-gray-400">
                  {formatDate(t.updatedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlatformAnnouncementsModal({ onClose }: { onClose: () => void }) {
  const { data: announcements, isLoading } = usePlatformAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function handleCreate() {
    await createAnnouncement.mutateAsync({ title, body, isActive: true });
    setTitle("");
    setBody("");
    setShowForm(false);
  }

  return (
    <div className="fixed inset-0 z-1000000001 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-gray-900">
            Platform Announcements
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {showForm ? (
          <div className="flex flex-col gap-3 mb-5">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Announcement message"
              rows={3}
              className="border border-gray-200 rounded-lg px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!title || !body || createAnnouncement.isPending}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createAnnouncement.isPending && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Publish
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 mb-5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Announcement
          </button>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            Loading announcements...
          </div>
        ) : !announcements?.length ? (
          <p className="text-center text-[13px] text-gray-400 py-12">
            No announcements yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="border border-gray-200 rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-medium text-gray-900">
                    {a.title}
                  </p>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      a.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500">{a.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <AdminPageHeader title="Announcements" />

      <div className="px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <Mail size={16} className="text-blue-600" />
            </div>
            <h2 className="text-[14px] font-semibold text-gray-900 mb-1.5">
              Email Templates
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Customize transactional emails: welcome, verification, receipts,
              and notifications.
            </p>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-[13px] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Edit Templates
            </button>
          </div>

          <div className="border border-[#E5E7EB] rounded-xl p-5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <Megaphone size={16} className="text-blue-600" />
            </div>
            <h2 className="text-[14px] font-semibold text-gray-900 mb-1.5">
              Platform Announcements
            </h2>
            <p className="text-[13px] text-gray-500 mb-4">
              Create and schedule system-wide announcements and maintenance
              notices.
            </p>
            <button
              onClick={() => setShowAnnouncements(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-[13px] font-medium text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Manage Announcements
            </button>
          </div>
        </div>
      </div>

      {showTemplates && (
        <EmailTemplatesModal onClose={() => setShowTemplates(false)} />
      )}
      {showAnnouncements && (
        <PlatformAnnouncementsModal
          onClose={() => setShowAnnouncements(false)}
        />
      )}
    </div>
  );
}
