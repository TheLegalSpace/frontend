// app/signin/SignInClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginPayload } from "@/services/auth.services";
import { AuthError, useAuth } from "../context/AuthContext";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

declare const google: {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          theme?: string;
          size?: string;
          width?: string;
          text?: string;
        },
      ) => void;
    };
  };
};

export default function SignInClient() {
  const { login, loginWithGoogle } = useAuth();
  // const router = useRouter();
  const searchParams = useSearchParams();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackError = searchParams.get("error");

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const payload: LoginPayload = { authProvider: "email", email, password };
      await login(payload);
      // const redirect = searchParams.get("redirect") ?? "/dashboard/feeds";
      // router.push(redirect);
    } catch (err: unknown) {
      const authErr = err as AuthError;
      setError(authErr?.message ?? "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (typeof google === "undefined") return;

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (resp: { credential: string }) => {
          setGoogleLoading(true);
          setError("");
          try {
            const base64 = resp.credential
              .split(".")[1]
              .replace(/-/g, "+")
              .replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));
            const fullName =
              payload.name ??
              `${payload.given_name ?? ""} ${payload.family_name ?? ""}`.trim();
            const avatarUrl = payload.picture ?? undefined;
            await loginWithGoogle(resp.credential, fullName, avatarUrl);
            // router.push(searchParams.get("redirect") ?? "/dashboard/feeds");
          } catch (err: unknown) {
            const authErr = err as AuthError;
            setError(
              authErr?.message ?? "Google sign in failed. Please try again.",
            );
          } finally {
            setGoogleLoading(false);
          }
        },
      });

      if (googleButtonRef.current) {
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "continue_with",
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

  const anyLoading = isLoading || googleLoading;

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/signinbg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000000cc",
        backgroundBlendMode: "darken",
      }}
    >
      {/* ✅ Top logo — matches Figma top-left */}
      <div className="px-6 pt-5">
        <div className="flex items-center gap-2">
          <img src="/tls-logo-white.png" alt="TLS" className="h-9" />
        </div>
      </div>

      {/* ✅ Centered card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[400px] bg-[#111111]/50 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-14">
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="font-[Instrument_Serif] text-[28px] text-white font-normal mb-1.5">
              TheLegalSpace
            </h1>
            <p className="text-[13px] text-white/50">
              Your legal community is waiting.
            </p>
          </div>

          {/* Callback error */}
          {callbackError && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/20 border border-red-400/30 rounded-xl">
              <p className="text-[12px] text-red-300">
                {callbackError === "google_failed"
                  ? "Google sign in failed. Please try again."
                  : "Something went wrong. Please try again."}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-white/60">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={anyLoading}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-white/60">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={anyLoading}
                  className="w-full px-4 py-3 pr-11 bg-[#1a1a1a] border border-white/10 rounded-xl text-[13px] text-white placeholder:text-white/20 outline-none focus:border-white/30 disabled:opacity-50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-[12px] text-red-400 -mt-1">{error}</p>}

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                className="text-[13px] text-[#1A56DB] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={anyLoading}
              className="w-full py-3 bg-[#1A56DB] hover:bg-[#1648b8] text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* OR divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="ms-6 flex-1 h-px bg-white" />
            <span className="text-[12px] text-white">OR</span>
            <div className="flex-1 h-px bg-white me-6" />
          </div>

          {/* ✅ Custom Google button matching Figma dark style */}
          <div className="relative">
            {/* Hidden Google button for functionality */}
            <div
              ref={googleButtonRef}
              className="absolute inset-0 opacity-0 z-10 w-full overflow-hidden"
            />
            {/* Visible custom button */}
            <button
              type="button"
              disabled={anyLoading}
              className="w-full py-3 bg-[#1a1a1a] border border-white/10 hover:border-white/20 hover:bg-[#222] text-white text-[14px] font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Register link */}
          <p className="text-center text-[13px] text-white/40 mt-5">
            New to TheLegalSpace?{" "}
            <Link
              href="/signup"
              className="text-[#1A56DB] hover:underline font-medium"
            >
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
