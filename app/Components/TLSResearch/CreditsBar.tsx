"use client";

import { useState } from "react";
import { useCredits } from "@/hooks/useCredits";
import BuyCreditsModal from "./BuyCreditsModal";

const LOW_BALANCE_THRESHOLD = 3;

export default function CreditsBar() {
  const { data: wallet, isLoading } = useCredits();
  const [showBuyModal, setShowBuyModal] = useState(false);

  if (isLoading || !wallet) {
    return (
      <div className="w-full rounded-xl bg-[#111214] px-5 py-4 h-[68px] animate-pulse" />
    );
  }

  const isLow = wallet.balance <= LOW_BALANCE_THRESHOLD;

  return (
    <>
      <div className="w-full rounded-xl bg-[#111214] px-5 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
            AI Credits
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold text-white leading-none">
              {wallet.balance}
            </span>
            <span className="text-[13px] text-gray-400">Left</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed max-w-md">
            Buy AI credits to power legal research, document analysis,
            drafting, and other AI features across TLS.
          </p>
          <p className="text-[10px] text-gray-600 mt-1">
            {wallet.monthlyAllowance} free/month, renews monthly · unused
            credits roll over
          </p>
          {isLow && (
            <p className="text-[11px] text-amber-400 mt-1.5 font-medium">
              Running low — top up to avoid interruptions.
            </p>
          )}
        </div>

        <button
          onClick={() => setShowBuyModal(true)}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-white text-gray-900 text-[13px] font-medium hover:bg-gray-100 transition whitespace-nowrap"
        >
          Buy AI Credits
        </button>
      </div>

      {showBuyModal && (
        <BuyCreditsModal onClose={() => setShowBuyModal(false)} />
      )}
    </>
  );
}