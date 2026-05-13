// app/auth/callback/AuthCallbackClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { authService } from "@/services/auth.services";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false); // ✅ prevent double execution

  useEffect(() => {
    const processSession = async (session: Session) => {
      if (hasProcessed.current) return; // ✅ guard against double run
      hasProcessed.current = true;

      try {
        const idToken: string | undefined =
          session.provider_token ?? session.access_token ?? undefined;

        if (!idToken) {
          console.error("No token available");
          router.replace("/signin?error=google_failed");
          return;
        }

        console.log("Sending to backend — authProvider: google");
        console.log("Token starts with:", idToken.slice(0, 20) + "...");

        const response = await authService.login({
          authProvider: "google",
          idToken,
        });

        console.log("Backend response:", response?.data);

        if (!response?.data?.data) {
          console.error("Unexpected shape:", response?.data);
          router.replace("/signin?error=google_failed");
          return;
        }

        const { account, session: appSession } = response.data.data;

        localStorage.setItem("accessToken", appSession.accessToken);
        localStorage.setItem("refreshToken", appSession.refreshToken);
        localStorage.setItem("user", JSON.stringify(account));

        const redirect = searchParams.get("redirect") ?? "/dashboard/feeds";
        router.replace(redirect);
      } catch (err: unknown) {
        // ✅ Reset so user can retry
        hasProcessed.current = false;

        if (typeof err === "object" && err !== null) {
          const axiosErr = err as any;
          // ✅ This is what the backend is actually saying
          console.error("Backend status:", axiosErr?.response?.status);
          console.error("Backend message:", axiosErr?.response?.data);
        }
        router.replace("/signin?error=google_failed");
      }
    };

    const handleCallback = async () => {
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        const { data, error } = await supabase.auth.getSession();
        console.log("Session:", data?.session ? "found" : "null", "Error:", error?.message);

        if (data.session) {
          await processSession(data.session);
          return;
        }
      }

      // Fallback listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session: Session | null) => {
          if (event === "SIGNED_IN" && session) {
            await processSession(session);
            authListener.subscription.unsubscribe();
          }
        }
      );

      setTimeout(() => {
        authListener.subscription.unsubscribe();
        router.replace("/signin?error=timeout");
      }, 10000);
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Signing you in with Google...</p>
      </div>
    </div>
  );
}