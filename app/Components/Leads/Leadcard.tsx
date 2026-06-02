"use client";

import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { Lead } from "@/app/types/leads";
import { leadsService } from "@/services/leads.services";
import Image from "next/image";

function getInitials(name: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(name: string) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
  ];
  if (!name) return colors[0];
  return colors[name.charCodeAt(0) % colors.length];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatBudget(budget?: string) {
  if (!budget) return "";
  const map: Record<string, string> = {
    under_50k: "Under ₦50k",
    "50k_to_100k": "₦50k–₦100k",
    "100k_to_500k": "₦100k–₦500k",
    "500k_to_1m": "₦500k–₦1M",
    above_1m: "Above ₦1M",
    under_100k: "Under ₦100k",
    "50k_to_200k": "₦50k–₦200k",
    "500k_to_2m": "₦500k–₦2M",
    above_2m: "Above ₦2M",
  };
  return map[budget] ?? budget.replace(/_/g, " ");
}

interface Props {
  lead: Lead;
  onUpdate: (id: string, status: "accepted" | "declined") => void;
  // Optional: pass matter name if you resolve it in the parent
  matterName?: string;
}

export default function LeadCard({ lead, onUpdate, matterName }: Props) {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [error, setError] = useState("");

  const { userAccount, intakePayload, createdAt, status, relevanceScore } = lead;
  const isPending = status === "pending";

  const displayName = userAccount?.isAnonymous
    ? "Anonymous User"
    : (userAccount?.fullName ?? "Unknown");

  const rating = parseFloat(userAccount?.avgRating ?? "0").toFixed(1);

  async function handleAccept() {
    setError("");
    setAccepting(true);
    try {
      await leadsService.acceptLead(lead.id);
      onUpdate(lead.id, "accepted");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline() {
    setError("");
    setDeclining(true);
    try {
      await leadsService.declineLead(lead.id);
      onUpdate(lead.id, "declined");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to decline");
    } finally {
      setDeclining(false);
    }
  }

  return (
    <div className="bg-white border-b border-gray-100 px-5 py-5">
      {/* Header — avatar + name + rating */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`relative w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0 overflow-hidden ${avatarColor(
              userAccount?.fullName ?? ""
            )}`}
          >
            {userAccount?.avatarUrl ? (
              <Image
                src={userAccount.avatarUrl}
                alt={displayName}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              getInitials(userAccount?.fullName ?? "")
            )}
          </div>
          <span className="text-[15px] font-semibold text-gray-900">
            {displayName}
          </span>
        </div>
        <span className="text-[13px] text-gray-500">
          {rating}/5★
        </span>
      </div>

      {/* Free text body */}
      {intakePayload?.freeText && (
        <p className="text-[13px] text-gray-600 leading-relaxed mb-3">
          {intakePayload.freeText}
        </p>
      )}

      {/* Matter card — dark background */}
      <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 bg-white mb-3">
        <div className="flex items-center gap-2.5">
          {/* Lead badge thumbnail */}
          <div className="w-10 h-10 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
            <span className="text-[7px] font-bold uppercase tracking-widest text-gray-500">
              LEAD
            </span>
          </div>

          <div>
            <p className="text-[13px] font-medium text-gray-900">
              {matterName ?? intakePayload?.location ?? "Legal Matter"}
            </p>
            {intakePayload?.budget && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                Budget: {formatBudget(intakePayload.budget)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock size={11} />
            {timeAgo(createdAt)}
          </span>
          <span className="text-[11px] text-green-400 font-medium">
            {relevanceScore}% match
          </span>
        </div>
      </div>

      {error && <p className="text-[12px] text-red-500 mb-2">{error}</p>}

      {/* Actions */}
      {isPending ? (
        <div className="flex items-center justify-end gap-6 pt-1">
          <button
            onClick={handleDecline}
            disabled={declining || accepting}
            className="flex items-center gap-1 text-[12px] font-medium text-red-500 hover:text-red-600 transition disabled:opacity-50"
          >
            {declining && (
              <Loader2 size={12} className="animate-spin" />
            )}
            Don't follow up with client
          </button>

          <button
            onClick={handleAccept}
            disabled={accepting || declining}
            className="flex items-center gap-1 text-[12px] font-medium text-green-600 hover:text-green-700 transition disabled:opacity-50"
          >
            {accepting && (
              <Loader2 size={12} className="animate-spin" />
            )}
            Respond to client
          </button>
        </div>
      ) : (
        <div className="flex justify-end">
          <span
            className={`text-[12px] px-2.5 py-1 rounded-full font-medium ${
              status === "accepted"
                ? "bg-green-50 text-green-700"
                : status === "declined"
                ? "bg-red-50 text-red-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}
