// app/admin/docket/[id]/page.tsx
"use client";

import { use } from "react";
import EventDetailsPage from "@/app/Components/Admin/Docket/EventDetailsPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EventDetailsPage eventId={id} />;
}
