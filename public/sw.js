// sw.js - Service Worker básico
self.addEventListener('push', function (event) {
    console.log('Notificación de empuje recibida.');
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    // Abrir la web al hacer clic
    event.waitUntil(
        clients.openWindow('/')
    );
});
