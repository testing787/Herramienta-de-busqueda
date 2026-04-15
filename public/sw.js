// sw.js
self.addEventListener('push', function(event) {
  // Para recibir notificaciones push remotas en el futuro
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Lógica para abrir la app al hacer clic
  event.waitUntil(clients.openWindow('/'));
});