// components/settings/SettingsPage.tsx
"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useEffect, useRef } from "react";
>>>>>>> origin/Fixed-At-Last
import {
  Mail,
  Lock,
  Trash2,
  Loader2,
  Check,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { useMe } from "@/hooks/useProfile";
import {
  useUpdateProfile,
  useToggleAnonymous,
  useDeleteAccount,
} from "@/hooks/useSettings";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { USER_ROLES } from "../types/types";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: profile, isLoading } = useMe();
  const router = useRouter();

  const updateProfile = useUpdateProfile();
  const toggleAnonymous = useToggleAnonymous();
  const deleteAccount = useDeleteAccount();

<<<<<<< HEAD
=======
  const isMountedRef = useRef(true);
  const saveSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (saveSuccessTimeoutRef.current) {
        clearTimeout(saveSuccessTimeoutRef.current);
      }
    };
  }, []);

>>>>>>> origin/Fixed-At-Last
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const isLawyer = user?.role === USER_ROLES.LAWYER;
  const isFirm = user?.role === USER_ROLES.FIRM;
  const isUser = user?.role === USER_ROLES.USER;
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  useEffect(() => {
    if (!profile) return;

    // ✅ Handle both shapes — profile or profile.data
    const data = (profile as any)?.data ?? profile;
    console.log("user?.role", user?.role);
    console.log(
      "isLawyer, isFirm, isUser, isAdmin",
      isLawyer,
      isFirm,
      isUser,
      isAdmin,
    ); // ← verify type

    const fullName: string = data?.fullName ?? "";
    const parts = fullName.trim().split(" ");
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" ") ?? "");
    setEmail(data?.email ?? "");
    setPhone(data?.phone ?? "");
    setIsAnonymous(data?.isAnonymous ?? false);
  }, [profile]);

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess(false);
<<<<<<< HEAD
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile.mutateAsync({ fullName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(
        err?.response?.data?.message ?? "Failed to save. Please try again.",
      );
=======
    if (saveSuccessTimeoutRef.current) {
      clearTimeout(saveSuccessTimeoutRef.current);
      saveSuccessTimeoutRef.current = null;
    }
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile.mutateAsync({ fullName });
      if (isMountedRef.current) {
        setSaveSuccess(true);
        saveSuccessTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setSaveSuccess(false);
          }
        }, 3000);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setSaveError(
          err?.response?.data?.message ?? "Failed to save. Please try again.",
        );
      }
>>>>>>> origin/Fixed-At-Last
    }
  };

  const handleToggleAnonymous = async (value: boolean) => {
<<<<<<< HEAD
=======
    const originalValue = isAnonymous;
>>>>>>> origin/Fixed-At-Last
    setIsAnonymous(value);
    try {
      await toggleAnonymous.mutateAsync(value);
    } catch {
<<<<<<< HEAD
      setIsAnonymous(!value);
=======
      if (isMountedRef.current) {
        setIsAnonymous(originalValue);
      }
>>>>>>> origin/Fixed-At-Last
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    try {
      await deleteAccount.mutateAsync();
      await logout();
<<<<<<< HEAD
      router.push("/");
    } catch (err: any) {
      setSaveError(err?.response?.data?.message ?? "Failed to delete account.");
      setShowDeleteConfirm(false);
=======
      if (isMountedRef.current) {
        router.push("/");
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setSaveError(err?.response?.data?.message ?? "Failed to delete account.");
        setShowDeleteConfirm(false);
      }
>>>>>>> origin/Fixed-At-Last
    }
  };

  const data = (profile as any)?.data ?? profile;
  const hasChanges =
    !!data &&
    `${firstName} ${lastName}`.trim() !== (data?.fullName ?? "").trim();

  // ✅ Shared disabled field style
  const disabledField =
    "w-full px-3 py-2.5 pr-10 text-[13px] border border-gray-200 rounded-xl outline-none bg-gray-50 text-gray-400 cursor-not-allowed select-none";
  const activeField =
    "w-full px-3 py-2.5 pr-10 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-gray-400 transition-colors bg-white text-gray-900";

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-[15px] font-medium text-gray-900 mb-6">Settings</h1>

      <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden">
        {/* Personal Information */}
        <div className="px-6 py-6 border-b border-[#E5E7EB]">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-4">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* First Name — editable */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={activeField}
                  placeholder="First Name"
                  readOnly
                  disabled={true}
                />
              </div>
            </div>

            {/* Last Name — editable */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-gray-400">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={activeField}
                  placeholder="Last Name"
                  readOnly
                  disabled={true}
                />
              </div>
            </div>
          </div>

          {/* Email — locked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] text-gray-400">Email Address</label>
              <div className="relative w-full ">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  className={`${disabledField} pl-9`}
                  placeholder="Email"
                />
                {/* ✅ Black lock icon signals disabled */}
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-900" />
              </div>
              <p className="text-[10px] text-gray-400">
                Email address cannot be changed.
              </p>
            </div>
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[11px] text-gray-400">Email Address</label>
              <div className="relative w-full ">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="email"
                  value={phone ?? ""}
                  className={`w-full px-3 py-2.5 pr-10 text-[13px] border border-gray-200 rounded-xl outline-none bg-gray-50 text-black  select-none pl-9`}
                  placeholder="Phone Number"
                />
                {/* ✅ Black lock icon signals disabled */}
                {/* <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-900" /> */}
              </div>
              <p className="text-[10px] text-gray-400">
                Email address cannot be changed.
              </p>
            </div>
          </div>

          {saveError && (
            <p className="text-[12px] text-red-500 mb-3">{saveError}</p>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-[12px] text-green-600 mb-3">
              <Check className="w-3.5 h-3.5" />
              Changes saved successfully
            </div>
          )}

          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-[12px] font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </button>
          )}
        </div>

        {/* Anonymous */}
        {isUser && (
          <div className="px-6 py-6 border-b border-[#E5E7EB]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-semibold text-gray-900 mb-1">
                  Anonymous
                </h2>
                <p className="text-[12px] text-gray-400 leading-relaxed max-w-md">
                  Stay anonymous while chatting. Your identity will only be
                  shared when you choose to reveal it.
                </p>
              </div>
              <button
                onClick={() => handleToggleAnonymous(!isAnonymous)}
                disabled={toggleAnonymous.isPending}
                aria-label="Toggle anonymous mode"
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                  isAnonymous ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    isAnonymous ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {toggleAnonymous.isPending && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating...
              </div>
            )}
            {toggleAnonymous.isSuccess && !toggleAnonymous.isPending && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-green-600">
                <Check className="w-3 h-3" />
                {isAnonymous ? "You are now anonymous" : "You are now visible"}
              </div>
            )}
          </div>
        )}

        {/* Delete Account */}
        <div className="px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[13px] font-semibold text-gray-900 mb-1">
                Delete Account
              </h2>
              <p className="text-[12px] text-gray-400 leading-relaxed max-w-md">
                This action will permanently remove your account and profile
                from TheLegalSpace.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
              aria-label="Delete account"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
              setDeleteConfirmText("");
            }
          }}
        >
          <div className="w-full max-w-sm bg-white rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-gray-900">
                  Delete your account?
                </h3>
                <p className="text-[12px] text-gray-400">
                  This cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
              All your data, profile, connections, and activity will be
              permanently deleted. Type{" "}
              <span className="font-mono font-medium text-gray-900">
                DELETE
              </span>{" "}
              to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-red-300 mb-4 transition-colors"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmText !== "DELETE" || deleteAccount.isPending
                }
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-[13px] font-medium hover:bg-red-600 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {deleteAccount.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {deleteAccount.isPending ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
