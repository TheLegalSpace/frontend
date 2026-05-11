// app/signin/page.tsx
"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Email login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ authProvider: "email", email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Google login — gets idToken from Google, sends to your backend
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Fetch user info from Google to get fullName
        const googleUser = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        ).then((r) => r.json());

        await loginWithGoogle(tokenResponse.access_token, googleUser.name);
        router.push("/feeds");
      } catch (err: any) {
        setError(err.response?.data?.message ?? "Google login failed");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Google login was cancelled or failed"),
  });

  return (
    <div>
      {/* Email form */}
      <form onSubmit={handleEmailSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div>or</div>

      {/* Google button */}
      <button onClick={() => handleGoogleLogin()} disabled={isLoading}>
        Continue with Google
      </button>
    </div>
  );
}