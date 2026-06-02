// app/forgot-password/page.tsx
import { Suspense } from "react";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordClient />
    </Suspense>
  );
}
