// app/signin/SignInClientUser.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthError, useAuth } from "../context/AuthContext";
import Image from "next/image";
// Save your illustration here (rename if needed):
import signinIllustration from "../../public/signin-illustration.jpg";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

declare const google: any;

export default function SignInClient() {
  const { loginWithGoogle } = useAuth();
  const searchParams = useSearchParams();

  // Real Google button — rendered directly over the visible custom button,
  // not off-screen. The user's actual click lands on it, which is far more
  // reliable than dispatching a synthetic .click() on a hidden iframe.
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleReady, setGoogleReady] = useState<boolean>(false);

  const callbackError = searchParams.get("error");

  // 1. Initialise Google Identity once the script is available
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof google === "undefined") return;
      clearInterval(interval);

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
          } catch (err: unknown) {
            const authErr = err as AuthError;
            setError(
              authErr?.message ?? "Google sign in failed. Please try again.",
            );
          } finally {
            setIsLoading(false);
          }
        },
      });

      setGoogleReady(true);
    }, 100);

    return () => clearInterval(interval);
  }, [loginWithGoogle]);

  // 2. Render the REAL Google button, sized to fill its wrapper and
  //    stacked on top of the styled button below via CSS (see JSX).
  useEffect(() => {
    if (!googleReady) return;
    const el = googleButtonRef.current;
    if (!el || typeof google === "undefined") return;

    el.innerHTML = "";
    google.accounts.id.renderButton(el, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: "100%",
    });
  }, [googleReady]);

  // 3. "Sign up" is a plain text link, not a button we can overlay — use
  //    Google's own prompt() API to trigger sign-in programmatically
  //    instead of faking a click on a hidden element.
  const triggerGoogle = () => {
    if (typeof google === "undefined" || !googleReady) return;
    google.accounts.id.prompt();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-black">
      <Navbar />

      {/* Main content area — vertically centered */}
      <main className="flex-1 w-full flex items-center">
        <div className="w-full h-[90vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Illustration — desktop only */}
            <div className="hidden lg:block">
              <Image
                src={signinIllustration}
                alt="The Legal Space community illustration"
                className="w-full h-auto  object-cover"
                priority
              />
            </div>

            {/* Sign-in content */}
            <div className="w-full px-4 lg:mx-0 text-left">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3 leading-tight font-dmSans">
                Welcome to The Legal Space
              </h1>
              <p className="text-base sm:text-lg text-gray-500 mb-8 leading-relaxed font-dmSans">
                Access legal support, professional insights, and trusted
                connections all in one place.
              </p>

              {/* Errors */}
              {(callbackError || error) && (
                <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-[13px] text-red-600">
                    {error ||
                      (callbackError === "google_failed"
                        ? "Google sign in failed. Please try again."
                        : "Something went wrong. Please try again.")}
                  </p>
                </div>
              )}

              {/* Custom button / loading, with the real Google button
                  overlaid invisibly on top so real clicks reach it */}
              {isLoading ? (
                <div className="w-full px-3 py-3.5 bg-white border border-gray-200 rounded-xl text-center">
                  <p className="text-[14px] text-gray-600 font-dmSans">
                    Signing you in…
                  </p>
                </div>
              ) : (
                <div className="relative w-full">
                  <div
                    ref={googleButtonRef}
                    aria-hidden
                    className="absolute inset-0 z-10 w-full opacity-0 overflow-hidden [&>div]:!w-full"
                  />
                  <button
                    type="button"
                    disabled={!googleReady}
                    className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-700 shadow-sm transition hover:bg-white active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed font-dmSans"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                </div>
              )}

              {/* Account link */}
              <p className="mt-6 text-center text-sm text-gray-600 font-dmSans">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={triggerGoogle}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer visible={false} />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}