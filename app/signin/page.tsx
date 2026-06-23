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
  // useEffect(() => {
  //   const loginType = localStorage.getItem("loginType");
  //   if (loginType) {
  //     setLoginType(loginType);
  //   } else {
  //     // router.push("/");
  //   }
  // }, []);

   useEffect(() => {
    // Pick which sign-in form to show based on a stored preference.
    // If none is set, fall back to the default — NEVER redirect away from
    // /signin, otherwise visiting it directly (or with cleared storage)
    // bounces the user back to the homepage.
    const stored = localStorage.getItem("loginType");
    if (stored === "lawyer" || stored === "user") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoginType(stored);
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
