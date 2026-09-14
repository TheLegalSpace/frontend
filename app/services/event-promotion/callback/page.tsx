// app/membership/callback/page.tsx
import { Suspense } from "react";
import EventPromotionCallbackClient from "./EventPromotionCallbackClient"


export const dynamic = "force-dynamic";

export default function EventPromotionCallbackPage() {
  return (
    <Suspense fallback={null}>
      <EventPromotionCallbackClient />
    </Suspense>
  );
}