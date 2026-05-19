// app/signin/SignInClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthError, useAuth } from "../context/AuthContext";
 
declare const google: any;

export default function SignInClient() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const callbackError = searchParams.get("error");

  useEffect(() => {
    const initGoogle = () => {
      if (typeof google === "undefined") return;

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (resp: { credential: string }) => {
          setIsLoading(true);
          setError("");
          try {
            const base64 = resp.credential
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));

            const fullName: string =
              payload.name ??
              `${payload.given_name ?? ""} ${payload.family_name ?? ""}`.trim();

            const avatarUrl: string | undefined = payload.picture ?? undefined;

            await loginWithGoogle(resp.credential, fullName, avatarUrl);
            router.push(searchParams.get("redirect") ?? "/dashboard/feeds");
          } catch (err: unknown) {
            const authErr = err as AuthError;
            setError(authErr?.message ?? "Google sign in failed. Please try again.");
          } finally {
            setIsLoading(false);
          }
        },
      });

      if (googleButtonRef.current) {
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "filled_black",
          size: "large",
          width: "320",
          text: "continue_with",
          shape: "pill",
        });
      }
    };

    const interval = setInterval(() => {
      if (typeof google !== "undefined") {
        clearInterval(interval);
        initGoogle();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loginWithGoogle]);

  return (
    <div
      className="signinbg min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/signinbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000000d3",
        backgroundBlendMode: "darken",
      }}
    >
      {/* Logo — top left */}
      <div className="px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md flex items-center justify-center text-white text-xs">
            ⚖
          </div>
          <span className="text-sm font-medium text-white/90">
            The Legal Space
          </span>
        </div>
      </div>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[360px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-10 text-center">

          {/* Heading */}
          <h1 className="text-[26px] font-light text-white mb-2 leading-tight">
            Get started with TheLegalSpace
          </h1>
          <p className="text-[14px] text-white/60 mb-8">
            Access legal help faster. No passwords. No hassle.
          </p>

          {/* Errors */}
          {(callbackError || error) && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/20 border border-red-400/30 rounded-xl">
              <p className="text-[12px] text-red-300">
                {error ||
                  (callbackError === "google_failed"
                    ? "Google sign in failed. Please try again."
                    : "Something went wrong. Please try again.")}
              </p>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="mb-4 px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl">
              <p className="text-[12px] text-white/70">Signing you in...</p>
            </div>
          )}

          {/* Google button */}
          <div
            ref={googleButtonRef}
            className="w-full flex justify-center"
          />
        </div>
      </div>
    </div>
  );
}