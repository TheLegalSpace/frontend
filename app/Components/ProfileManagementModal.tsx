// app/Components/Profile/ProfileManagementModal.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
import { useUpdateMe, useUploadAvatar } from "@/hooks/useProfile";
import { useToast } from "@/app/context/ToastContext";
import { USER_ROLES } from "@/app/types/types";
import type { ProfileData } from "@/app/Components/ProfileCard";

const MAX_BIO_WORDS = 25;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** firmProfile is an untyped record from the API — read the year defensively. */
function readEstablishmentYear(
  firmProfile: Record<string, unknown> | null,
): string {
  if (!firmProfile) return "";
  const raw =
    firmProfile.firmEstablishmentYear ??
    firmProfile.establishmentYear ??
    firmProfile.yearEstablished;
  return raw == null ? "" : String(raw);
}

interface ProfileManagementModalProps {
  profile: ProfileData;
  onClose: () => void;
}

export default function ProfileManagementModal({
  profile,
  onClose,
}: ProfileManagementModalProps) {
  const { showSuccess, showError } = useToast();
  const updateMe = useUpdateMe();
  const uploadAvatar = useUploadAvatar();

  const isFirm = profile.role === USER_ROLES.FIRM;

  const [bio, setBio] = useState(profile.bio ?? "");
  const [establishmentYear, setEstablishmentYear] = useState(
    isFirm ? readEstablishmentYear(profile.firmProfile) : "",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = useMemo(() => countWords(bio), [bio]);
  const overLimit = wordCount > MAX_BIO_WORDS;
  const isSaving = updateMe.isPending || uploadAvatar.isPending;

  // Revoke the object URL when it changes or on unmount (cleanup only — no setState).
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const displayedAvatar = previewUrl ?? profile.avatarUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showError("Image must be smaller than 5MB.");
      return;
    }
    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (overLimit) {
      showError(`Bio must be ${MAX_BIO_WORDS} words or fewer.`);
      return;
    }

    if (isFirm && establishmentYear.trim()) {
      const year = Number(establishmentYear);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1800 || year > currentYear) {
        showError("Enter a valid year of establishment.");
        return;
      }
    }

    // Only send fields that actually changed.
    const payload: Record<string, unknown> = {};

    const trimmedBio = bio.trim();
    if (trimmedBio !== (profile.bio ?? "")) {
      payload.bio = trimmedBio;
    }

    if (isFirm) {
      const original = readEstablishmentYear(profile.firmProfile);
      if (establishmentYear.trim() && establishmentYear.trim() !== original) {
        payload.firmProfile = {
          update: { firmEstablishmentYear: Number(establishmentYear) },
        };
      }
    }

    const hasFieldChanges = Object.keys(payload).length > 0;

    if (!avatarFile && !hasFieldChanges) {
      showError("Nothing to update.");
      return;
    }

    try {
      // Upload the avatar first so the patch + refetch reflects the new image.
      if (avatarFile) {
        await uploadAvatar.mutateAsync(avatarFile);
      }
      if (hasFieldChanges) {
        await updateMe.mutateAsync(payload);
      }
      showSuccess("Profile updated successfully");
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update profile. Please try again.";
      showError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100000 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Profile management"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Avatar uploader */}
        <div className="mb-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-24 w-24 overflow-hidden rounded-full bg-[#F3F4F6] transition-opacity hover:opacity-90"
            aria-label="Upload profile image"
          >
            {displayedAvatar ? (
              <img
                src={displayedAvatar}
                alt={profile.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                <ImageIcon
                  className="h-8 w-8 text-[#374151]"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-[14px] font-medium text-[#1F2937] hover:underline"
          >
            Click to upload image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Profile Bio */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="profile-bio"
              className="text-[13px] font-semibold text-[#1F2937]"
            >
              Profile Bio
            </label>
            <span
              className={`text-[11px] ${
                overLimit ? "text-red-500" : "text-[#9CA3AF]"
              }`}
            >
              {wordCount}/{MAX_BIO_WORDS} words
            </span>
          </div>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Max. 25 words"
            rows={5}
            className={`w-full resize-none rounded-xl border bg-[#F9FAFB] px-3.5 py-3 text-[14px] text-[#1F2937] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB] ${
              overLimit ? "border-red-400" : "border-[#E5E7EB]"
            }`}
          />
        </div>

        {/* Firm Establishment — firms only */}
        {isFirm && (
          <div className="mb-6">
            <label
              htmlFor="firm-establishment"
              className="mb-1.5 block text-[13px] font-semibold text-[#1F2937]"
            >
              Firm Establishment
            </label>
            <input
              id="firm-establishment"
              type="number"
              inputMode="numeric"
              value={establishmentYear}
              onChange={(e) => setEstablishmentYear(e.target.value)}
              placeholder="Type year of establishment"
              min={1800}
              max={new Date().getFullYear()}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-3 text-[14px] text-[#1F2937] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#2563EB]"
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || overLimit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Updating..." : "Update Changes"}
        </button>
      </div>
    </div>
  );
}
