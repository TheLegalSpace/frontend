// app/auth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { authService } from "@/services/auth.services";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        console.log("Auth event:", event);
        console.log("Full session:", JSON.stringify(session, null, 2));

        if (event === "SIGNED_IN" && session) {
          try {
            // Try provider_token first (raw Google token)
            // Fall back to access_token (Supabase token)
            const idToken = session.access_token;

            console.log("provider_token:", session.provider_token);
            console.log("access_token:", session.access_token);
            console.log("Sending idToken:", idToken);

            const response = await authService.login({
              authProvider: "google",
              idToken,
            });

            console.log("Backend response:", response.data);

            if (!response.data?.data) {
              console.error("Unexpected shape:", response.data);
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
            console.error("Full error object:", err);
            const message =
              err instanceof Error ? err.message : "Unknown error";
            console.error("Backend login error:", message);
            router.replace("/signin?error=google_failed");
          }
        }

        if (event === "SIGNED_OUT") {
          router.replace("/signin");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
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
