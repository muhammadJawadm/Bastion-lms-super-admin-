/* HireApp Admin — Service Worker */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

/* Show notification triggered from the main thread */
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SHOW_NOTIFICATION") return;
  const { title, body, tag, icon } = event.data;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: tag || "hireapp",
      renotify: true,
      vibrate: [200, 100, 200],
    })
  );
});

/* Handle real server-sent Web Push events */
self.addEventListener("push", (event) => {
  let data = { title: "HireApp Admin", body: "You have a new notification." };
  try { data = { ...data, ...event.data.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "hireapp",
      vibrate: [200, 100, 200],
    })
  );
});

/* Open/focus the admin panel when a notification is clicked */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        return self.clients.openWindow("/notifications");
      })
  );
});
