"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register the service worker
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });

      // Listen for controller changes (new SW activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controller changed.");
        // Optionally reload to get new version
        // window.location.reload();
      });
    }
  }, []);

  return null; // This component does not render anything
}