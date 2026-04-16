// sw.js

const CACHE_NAME = 'app-cache-v1';

/* ───────────────────────────────────────────
   INSTALACIÓN - Se activa cuando se registra
─────────────────────────────────────────── */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalado');
  // Forzar activación inmediata sin esperar a que
  // se cierren otras pestañas con el SW anterior
  self.skipWaiting();
});

/* ───────────────────────────────────────────
   ACTIVACIÓN - Toma control de la página
─────────────────────────────────────────── */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activo');
  // Tomar control inmediato de todos los clientes
  // Sin esto, el SW no controla la pestaña actual
  // hasta que el usuario recargue la página
  event.waitUntil(clients.claim());
});

/* ───────────────────────────────────────────
   PUSH - Para notificaciones remotas (futuro)
─────────────────────────────────────────── */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || '¡Notificación!', {
      body: data.body || '',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      tag: data.tag || 'general',
    })
  );
});

/* ───────────────────────────────────────────
   CLIC EN NOTIFICACIÓN - Abre o enfoca la app
─────────────────────────────────────────── */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    // Busca si ya hay una pestaña abierta con la app
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // Si ya está abierta, solo la enfoca
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no está abierta, abre una nueva pestaña
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

/* ───────────────────────────────────────────
   FETCH - Intercepta peticiones de red (opcional)
   Útil si quieres que funcione offline
─────────────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  // Por ahora solo dejamos pasar las peticiones normalmente
  // Si en el futuro quieres caché offline, aquí es donde va
  event.respondWith(fetch(event.request));
});