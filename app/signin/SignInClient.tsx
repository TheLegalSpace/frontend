// app/signin/SignInClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
 import { useRouter, useSearchParams } from "next/navigation";
import { LoginPayload } from "@/services/auth.services";
import { AuthError, useAuth } from "../context/AuthContext";

declare const google: any;

export default function SignInClient() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const callbackError = searchParams.get("error");

  const handleEmailSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const payload: LoginPayload = { authProvider: "email", email, password };
      await login(payload);
      const redirect = searchParams.get("redirect") ?? "/dashboard/feeds";
      router.push(redirect);
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

            console.log("Google user:", { fullName, avatarUrl });

            await loginWithGoogle(resp.credential, fullName, avatarUrl);
            router.push(searchParams.get("redirect") ?? "/dashboard/feeds");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-xl p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center text-white text-xs">
            ⚖
          </div>
          <span className="text-sm font-medium text-gray-900">
            The Legal Space
          </span>
        </div>

        <h1 className="text-[20px] font-medium text-gray-900 mb-1">
          Welcome back
        </h1>
        <p className="text-[13px] text-gray-400 mb-6">Sign in to your account</p>

        {/* Callback errors */}
        {callbackError && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-[12px] text-red-500">
              {callbackError === "google_failed"
                ? "Google sign in failed. Please try again."
                : "Something went wrong. Please try again."}
            </p>
          </div>
        )}

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 mb-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-3 py-2.5 text-[13px] border border-gray-200 rounded-lg outline-none focus:border-gray-400 disabled:opacity-50 transition-colors"
          />

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-[12px] text-gray-500 cursor-pointer">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <button
              type="button"
              className="text-[12px] text-[#1A56DB] hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <hr className="flex-1 border-gray-100" />
          <span className="text-[11px] text-gray-400">or continue with</span>
          <hr className="flex-1 border-gray-100" />
        </div>

        {/* Google button */}
        <div ref={googleButtonRef} className="w-full" />

        {/* Register link */}
        <p className="text-center text-[12px] text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <button className="text-[#1A56DB] hover:underline font-medium">
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}