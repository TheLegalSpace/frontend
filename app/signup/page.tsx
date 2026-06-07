// app/signup/page.tsx
import { Suspense } from "react";
import RegisterFlow from "../register/RegisterFlow";
 
export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black/80">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterFlow />
    </Suspense>
  );
}