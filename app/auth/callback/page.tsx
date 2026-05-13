// app/auth/callback/page.tsx

import { Suspense } from "react";
import AuthCallbackClient from "./AuthCallbackClient";

  
export const dynamic = "force-dynamic";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}