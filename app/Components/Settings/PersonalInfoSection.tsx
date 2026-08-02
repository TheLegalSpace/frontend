// components/settings/PersonalInfoSection.tsx
"use client";

import { useState, useEffect } from "react";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useUpdatePersonalInfo } from "@/hooks/useSettings";
import { useToast } from "@/app/context/ToastContext";

interface Props {
  fullName: string;
  email: string;
  role: string;
}

export default function PersonalInfoSection({
  fullName: initialFullName,
  email,
  role,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const updateInfo = useUpdatePersonalInfo();
  const { showSuccess, showError } = useToast();
  // ✅ Derive first/last from fullName
  const splitName = (name: string) => {
    const parts = name.trim().split(" ");
    return {
      first: parts[0] ?? "",
      last: parts.slice(1).join(" "),
    };
  };

  const [firstName, setFirstName] = useState(
    () => splitName(initialFullName).first,
  );
  const [lastName, setLastName] = useState(
    () => splitName(initialFullName).last,
  );

  // ✅ Sync local state when props update
  // This fires when the parent re-renders with fresh data from useMe()
  useEffect(() => {
    if (!editing) {
      // Only sync when not actively editing — don't overwrite user's in-progress edits
      const { first, last } = splitName(initialFullName);
      setFirstName(first);
      setLastName(last);
    }
  }, [initialFullName, editing]);

  const handleSave = async () => {
    setError("");
    const combined = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!combined) {
      setError("Name cannot be empty.");
      return;
    }
    try {
      await updateInfo.mutateAsync({
        fullName: combined,
        role,
      });
      setEditing(false);
      showSuccess("Changes saved successfully");
    } catch (err: any) {
      showError("Error saving changes. Retry!");
      setError(err?.response?.data?.message ?? "Failed to save changes.");
    }
  };

  const handleCancel = () => {
    // ✅ Reset to current prop values
    const { first, last } = splitName(initialFullName);
    setFirstName(first);
    setLastName(last);
    setError("");
    setEditing(false);
  };

  return (
    <div className="pb-6 border-b border-[#E5E7EB] border-t-0">
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
            {role?.toLowerCase() === "firm" ? "Firm" : "First"} Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={!editing}
              className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#2563EB] disabled:bg-white disabled:text-gray-600 transition-colors"
            />
            {!editing && (
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            )}
          </div>
        </div>

        {/* Last Name */}
        {role?.toLowerCase() !== "firm" ? (
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
                className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-lg text-[13px] text-gray-800 outline-none focus:border-[#2563EB] disabled:bg-white disabled:text-gray-600 transition-colors"
              />
              {!editing && (
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              )}
            </div>
          </div>
        ) : (
          <div></div>
        )}

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
              className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-600 bg-white outline-none"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          </div>
        </div>

      </div>
    </div>
  );
}
