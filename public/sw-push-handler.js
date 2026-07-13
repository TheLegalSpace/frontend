// sw-push-handler.js
//
// Push event handlers injected into the production service worker generated
// by @ducanh2912/next-pwa (via customWorkerSrc in next.config.ts).
//
// This handles incoming push notifications and notification clicks when
// the PWA is installed and running as a standalone app.

self.addEventListener("push", function (event) {
  if (!event.data) {
    event.waitUntil(
      self.registration.showNotification("The Legal Space", {
        body: "You have a new update",
        icon: "/icons/icon-192.png",
      }),
    );
    return;
  }

  let title = "The Legal Space";
  let options = {
    body: "You have a new update",
    icon: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: {},
    tag: "default",
    requireInteraction: true,
  };

  try {
    const data = event.data.json();
    title = data.title || title;
    options.body = data.body || options.body;
    options.icon = data.icon || options.icon;
    options.data = data.data || {};
    options.tag = data.tag || options.tag;
  } catch (e) {
    const text = event.data.text();
    options.body = text || options.body;
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard/notifications";
  const origin = self.location.origin;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(origin + url);
        }
      }),
  );
});
