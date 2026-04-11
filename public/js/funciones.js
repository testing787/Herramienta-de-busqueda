function obtenerUbicacion() {
    const resultado = document.getElementById("resultado");

    if (!resultado) {
        console.error("No existe el elemento #resultado");
        return;
    }

    if (navigator.geolocation) {

        resultado.innerHTML = "Solicitando ubicación...";

        navigator.geolocation.getCurrentPosition(
            function (posicion) {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;

                resultado.innerHTML = `
                    <strong>Latitud:</strong> ${lat} <br>
                    <strong>Longitud:</strong> ${lon}
                `;
            },
            function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        resultado.innerHTML = "El usuario rechazó el permiso.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        resultado.innerHTML = "Ubicación no disponible.";
                        break;
                    case error.TIMEOUT:
                        resultado.innerHTML = "Tiempo de espera agotado.";
                        break;
                    default:
                        resultado.innerHTML = "Error desconocido.";
                }
            }
        );

    } else {
        resultado.innerHTML = "Tu navegador no soporta geolocalización.";
    }
}
const NotificadorInvasivo = {
    solicitarPermiso: function (intervaloMs) {
        // Verificar si el navegador soporta notificaciones
        if (!("Notification" in window)) {
            console.error("Este navegador no soporta notificaciones de escritorio.");
            return;
        }

        // Revisar el estado actual del permiso
        if (Notification.permission === "granted") {
            this.iniciarIntervalo(intervaloMs);
        } else if (Notification.permission !== "denied") {
            // Solicitar permiso al usuario
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    this.enviarNotificacion("¡Gracias!", "Ahora recibirás actualizaciones periódicas.");
                    this.iniciarIntervalo(intervaloMs);
                }
            });
        }
    },

    // Método para enviar la notificación física
    enviarNotificacion: function (titulo, mensaje) {
        const opciones = {
            body: mensaje,
            icon: "https://tu-sitio.com/icono.png" // Opcional: ruta a tu logo
        };
        new Notification(titulo, opciones);
    },

    // Temporizador (cada cierto tiempo)
    iniciarIntervalo: function (ms) {
        console.log(`Notificaciones activadas cada ${ms / 1000} segundos.`);
        setInterval(() => {
            this.enviarNotificacion("Recordatorio", "Has estado en nuestra web por un buen rato.");
        }, ms);
    }
};

//Ejecución al cargar la página
window.onload = () => {
    // Ejemplo: Pedir permiso y notificar cada 5 minutos (300,000 ms)
    NotificadorInvasivo.solicitarPermiso(300000);
};
