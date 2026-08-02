"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { creditsService, CreditPack } from "@/services/credits.services";
import { useCredits } from "@/hooks/useCredits";

interface Props {
  onClose: () => void;
}

function formatNaira(priceKobo: number) {
  return `₦${(priceKobo / 100).toLocaleString("en-NG")}`;
}

// Backend sends code: "small" | "medium" | "bulk" with name: "Small" | "Medium" | "Bulk".
// Design calls for different display labels — map by code, don't trust pack.name for display.
const DISPLAY_NAME: Record<CreditPack["code"], string> = {
  small: "Starter",
  medium: "Professional",
  bulk: "Business",
};

const DISPLAY_DESC: Record<CreditPack["code"], string> = {
  small: "Perfect for occasional AI use.",
  medium: "Perfect for active lawyers.",
  bulk: "For firms and heavy AI users.",
};

const RECOMMENDED_CODE: CreditPack["code"] = "medium";

export default function BuyCreditsModal({ onClose }: Props) {
  const { data: wallet, isLoading } = useCredits();
  const [purchasing, setPurchasing] = useState<CreditPack["code"] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const packs = wallet?.packs ?? [];

  async function handleBuy(packCode: CreditPack["code"]) {
    setError(null);
    setPurchasing(packCode);
    try {
      const callbackUrl = `${window.location.origin}/credits/callback`;
      const { authorizationUrl } = await creditsService.startPurchase(
        packCode,
        callbackUrl
      );
      window.location.href = authorizationUrl;
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Couldn't start checkout. Please try again."
      );
      setPurchasing(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 pt-6">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900">
              Choose a Credit Pack
            </h2>
            <p className="text-[12px] text-gray-500 mt-1 max-w-xs">
              Pick the option that works for you. Your AI credits never
              expire, so you can use them whenever you need AI assistance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition shrink-0"
          >
            <X size={15} className="text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Loading packs...
            </div>
          ) : (
            packs.map((pack) => {
              const isRecommended = pack.code === RECOMMENDED_CODE;
              const isThisPurchasing = purchasing === pack.code;
              const displayName = DISPLAY_NAME[pack.code] ?? pack.name;
              const displayDesc = DISPLAY_DESC[pack.code] ?? "";

              return (
                <div
                  key={pack.code}
                  className={`rounded-xl border overflow-hidden transition ${
                    isRecommended
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div>
                      <p className="text-[15px] font-semibold text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        {displayDesc}
                      </p>
                    </div>
                    <p className="text-[16px] font-semibold text-gray-900 whitespace-nowrap">
                      {pack.credits} Credits
                    </p>
                  </div>

                  <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 text-[12px] text-gray-500">
                    <span>{pack.credits} Credits</span>
                    <span>{formatNaira(pack.priceKobo)}</span>
                  </div>

                  <button
                    onClick={() => handleBuy(pack.code)}
                    disabled={purchasing !== null}
                    className={`w-full py-2.5 text-[13px] font-medium border-t transition flex items-center justify-center gap-2 ${
                      isRecommended
                        ? "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "border-gray-100 text-gray-700 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    {isThisPurchasing && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    Buy {displayName}
                  </button>
                </div>
              );
            })
          )}

          {error && (
            <p className="text-[12px] text-red-500 text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}