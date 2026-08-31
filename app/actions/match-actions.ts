// app/actions/match-actions.ts
"use server";

import { sendNotificationToUser } from "./notification-actions";

export async function notifyMatchFound(
  userId: string,
  lawyerName: string,
  caseType: string,
) {
  return await sendNotificationToUser(userId, {
    title: "🎯 Match Found!",
    body: `${lawyerName} is available for your ${caseType} case`,
    icon: "/pwa-192x192.png",
    data: {
      url: "/dashboard/matches",
    },
  });
}
