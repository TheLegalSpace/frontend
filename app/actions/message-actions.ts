// app/actions/message-actions.ts
"use server";

import { sendNotificationToUser } from "./notification-actions";

export async function sendMessageNotification(
  recipientId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string,
) {
  return await sendNotificationToUser(recipientId, {
    title: `New message from ${senderName}`,
    body: messagePreview.substring(0, 100),
    icon: "/pwa-192x192.png",
    data: {
      url: `/messages/${conversationId}`,
      conversationId,
    },
  });
}
