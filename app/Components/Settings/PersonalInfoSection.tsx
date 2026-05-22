// components/settings/PersonalInfoSection.tsx
"use client";

import { useState } from "react";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useUpdatePersonalInfo } from "@/hooks/useSettings";

interface Props {
  fullName: string;
  email: string;
  phone: string | null;
}

export default function PersonalInfoSection({
  fullName: initialFullName,
  email,
  phone: initialPhone,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [phone, setPhone] = useState(
    initialPhone?.replace("+234", "").trim() ?? "",
  );
  const [error, setError] = useState("");

  const updateInfo = useUpdatePersonalInfo();

  // ✅ Split for display only — sent as fullName to API
  const nameParts = fullName.trim().split(" ");
  const displayFirst = nameParts[0] ?? "";
  const displayLast = nameParts.slice(1).join(" ");

  const [firstName, setFirstName] = useState(displayFirst);
  const [lastName, setLastName] = useState(displayLast);

  const handleSave = async () => {
    setError("");
    const combined = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!combined) {
      setError("Name cannot be empty.");
      return;
    }
    try {
      await updateInfo.mutateAsync({
        fullName: combined, // ✅ sent as fullName
        phone: phone ? `+234${phone}` : "",
      });
      setFullName(combined);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save changes.");
    }
  };

  const handleCancel = () => {
    // Reset to saved values
    const parts = fullName.trim().split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" "));
    setPhone(initialPhone?.replace("+234", "").trim() ?? "");
    setError("");
    setEditing(false);
  };

  return (
    <div className="pb-6 border-b border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Personal Information
        </h2>
        <div className="flex items-center gap-3">
          {editing && (
            <button
              onClick={handleCancel}
              className="text-[13px] text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          )}
          {editing ? (
            <button
              onClick={handleSave}
              disabled={updateInfo.isPending}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#2563EB] hover:underline disabled:opacity-50"
            >
              {updateInfo.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {updateInfo.isPending ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[13px] font-medium text-[#2563EB] hover:underline"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-[12px] text-red-500">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-[12px] text-gray-500 mb-1.5">
            First Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!editing}
              className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#2563EB] disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
            />
            {!editing && (
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            )}
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-[12px] text-gray-500 mb-1.5">
            Last Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={!editing}
              className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#2563EB] disabled:bg-gray-50 disabled:text-gray-600 transition-colors"
            />
            {!editing && (
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            )}
          </div>
        </div>

        {/* Email — always locked */}
        <div>
          <label className="block text-[12px] text-gray-500 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="email"
              value={email}
              disabled
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-gray-50 outline-none"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-[12px] text-gray-500 mb-1.5">
            WhatsApp Number
          </label>
          <div
            className={`flex items-center border rounded-lg overflow-hidden transition-colors ${
              editing
                ? "border-gray-200 focus-within:border-[#2563EB]"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <span className="flex items-center gap-1 px-3 py-2.5 text-[13px] text-gray-500 border-r border-gray-200 bg-gray-50 shrink-0">
              +234
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              placeholder="704 2321 221"
              className="flex-1 px-3 py-2.5 text-[13px] text-gray-800 bg-transparent outline-none disabled:text-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
