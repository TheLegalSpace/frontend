// app/verify-reset-code/page.tsx
import { Suspense } from "react";
import VerifyResetCodeClient from "./VerifyResetCodeClient";

export const dynamic = "force-dynamic";

export default function VerifyResetCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyResetCodeClient />
    </Suspense>
  );
}
