// app/membership/callback/page.tsx
import { Suspense } from "react";
import MembershipCallbackClient from "./MembershipCallbackClient";


export const dynamic = "force-dynamic";

export default function MembershipCallbackPage() {
  return (
    <Suspense fallback={null}>
      <MembershipCallbackClient />
    </Suspense>
  );
}