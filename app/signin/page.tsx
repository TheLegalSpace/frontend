// app/signin/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import SignInClient from "./SignInClient";
import { useRouter } from "next/navigation";
import SignInClientUser from "./SignInClientUser";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const [loginType, setLoginType] = useState("user");
  const router = useRouter();
  useEffect(() => {
    const loginType = localStorage.getItem("loginType");
    if (loginType) {
      setLoginType(loginType);
    } else {
      router.push("/");
    }
  }, []);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      }
    >
      {loginType === "lawyer" ? <SignInClient /> : <SignInClientUser />}
    </Suspense>
  );
}
