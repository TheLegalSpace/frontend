// app/actions/appointment-actions.ts
"use server";

import { sendNotificationToUser } from "./notification-actions";

export async function sendAppointmentReminder(
  userId: string,
  lawyerName: string,
  appointmentTime: string,
) {
  return await sendNotificationToUser(userId, {
    title: "⏰ Appointment Reminder",
    body: `You have a meeting with ${lawyerName} at ${appointmentTime}`,
    icon: "/pwa-192x192.png",
    data: {
      url: "/dashboard/appointments",
    },
  });
}
