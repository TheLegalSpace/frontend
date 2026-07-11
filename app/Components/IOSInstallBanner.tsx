"use client";

import { useState, useEffect } from "react";
import { X, Share2 } from "lucide-react";

export function IOSInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const bannerDismissed = localStorage.getItem("ios-pwa-banner-dismissed");

    if (isIOS && !isStandalone && !bannerDismissed) {
      setShowBanner(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("ios-pwa-banner-dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex-shrink-0 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800">
              Install The Legal Space on your iPhone for the best experience:
            </p>
            <ol className="text-xs text-gray-600 mt-1 space-y-1 list-decimal list-inside">
              <li>
                Tap the Share button <Share2 className="inline w-3 h-3" />
              </li>
              <li>Scroll down and tap "Add to Home Screen"</li>
            </ol>
          </div>
          <button
            onClick={dismiss}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
