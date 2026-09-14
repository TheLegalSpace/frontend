// app/admin/support/[id]/page.tsx
"use client";

import { use } from "react";
import TicketDetailPage from "@/app/Components/Admin/SupportCenter/TicketDetailPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TicketDetailPage ticketId={id} />;
}
