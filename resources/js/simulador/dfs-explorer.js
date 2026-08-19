import planeIconUrl from '../../../public/plane.png';

// Variables de control de estado del explorador DFS
let googleMapInstance = null;
let lineaRutaActiva = null;
let marcadorAvionActivo = null;
let timeoutsYIntervalosDFS = [];

/**
 * Inicializador automático de la vista DFS
 */
function inicializarExploradorDFS() {
    if (!window.allDfsPaths || window.allDfsPaths.length === 0) return;

    // Crear el mapa limpio
    googleMapInstance = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    // Vincular los eventos de las tarjetas del panel izquierdo
    configurarEventosTarjetas();

    // Auto-seleccionar la primera opción por defecto
    const primeraTarjeta = document.querySelector('.route-card');
    if (primeraTarjeta) {
        primeraTarjeta.click();
    }
}

/**
 * Escucha los clicks en el panel lateral de Bootstrap
 */
function configurarEventosTarjetas() {
    document.querySelectorAll('.route-card').forEach(card => {
        card.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-route-index'));
            const pathSeleccionado = window.allDfsPaths[index];

            resaltarTarjetaUI(this);
            activarYAnimarCamino(pathSeleccionado);
        });
    });
}

function resaltarTarjetaUI(tarjetaSeleccionada) {
    document.querySelectorAll('.route-card').forEach(card => {
        card.classList.remove('border-primary', 'bg-light', 'shadow');
        card.style.transform = "scale(1)";
    });
    tarjetaSeleccionada.classList.add('border-primary', 'bg-light', 'shadow');
    tarjetaSeleccionada.style.transform = "scale(1.02)";
    tarjetaSeleccionada.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Limpia el escenario y prepara el avión con la estela vacía
 */
function activarYAnimarCamino(path) {
    // Matamos todos los hilos, animaciones y elementos anteriores
    limpiarProcesosAnteriores();

    // Reconstruimos el set de coordenadas de los aeropuertos del camino
    let coordenadasRuta = path.airports.map(airport => {
        return new google.maps.LatLng(parseFloat(airport.latitude), parseFloat(airport.longitude));
    });

    // Encajamos el zoom del mapa para ver los puntos clave
    const bounds = new google.maps.LatLngBounds();
    coordenadasRuta.forEach(coord => bounds.extend(coord));
    googleMapInstance.fitBounds(bounds);

    // Creamos la polilínea roja vacía. Se va a ir dibujando dinámicamente.
    lineaRutaActiva = new google.maps.Polyline({
        path: [], // <--- EMPIEZA VACÍA
        geodesic: true,
        strokeColor: "#d32f2f",
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map: googleMapInstance,
        zIndex: 999
    });

    // Calculamos las duraciones y las escalas (layovers) reales en base a las fechas de la BD
    let duracionesTramos = [];
    let esperasEscalas = []; // Guardará los delays en milisegundos simulados

    path.flights.forEach((flight, idx) => {
        // Duración multiplicada por 5 para mantener consistencia con tu factor de velocidad
        duracionesTramos.push(flight.duration * 5);

        if (idx === 0) {
            // El primer tramo sale de inmediato al seleccionar la tarjeta
            esperasEscalas.push(0);
        } else {
            // Escala = Salida del vuelo actual - Llegada del vuelo anterior
            let llegadaPrevio = new Date(path.flights[idx - 1].arrival_time).getTime();
            let salidaActual = new Date(flight.departure_time).getTime();
            let diferenciaMinutos = (salidaActual - llegadaPrevio) / 60000;
            
            // Aplicamos el factor de compresión de tiempo (x5) para que no sea eterno
            esperasEscalas.push(Math.max(0, diferenciaMinutos * 5));
        }
    });

    // Largamos el bucle de animación
    animarCicloCompletoDFS(coordenadasRuta, duracionesTramos, esperasEscalas, path.flights);
}


function animarCicloCompletoDFS(coordenadas, duraciones, delays, flightsData) {
    // Inicializamos el marcador con la imagen física y sus anclajes de rotación
    marcadorAvionActivo = new google.maps.Marker({
        position: coordenadas[0],
        map: googleMapInstance,
        zIndex: 1000,
        icon: {
            url: planeIconUrl,
            size: new google.maps.Size(512, 512),
            scaledSize: new google.maps.Size(36, 36), 
            anchor: new google.maps.Point(18, 18),     
            rotation: 0
        }
    });

    let currentPathIndex = 0;

    function procesarSiguienteTramo() {
        if (currentPathIndex >= coordenadas.length - 1) {
            let finRutaTimeout = setTimeout(() => {
                currentPathIndex = 0;
                if (lineaRutaActiva) lineaRutaActiva.setPath([]); 
                if (marcadorAvionActivo) {
                    marcadorAvionActivo.setPosition(coordenadas[0]);
                    let icon = marcadorAvionActivo.getIcon();
                    icon.rotation = 0;
                    marcadorAvionActivo.setIcon(icon);
                }
                procesarSiguienteTramo();
            }, 3000); 
            timeoutsYIntervalosDFS.push(finRutaTimeout);
            return;
        }

        const inicio = coordenadas[currentPathIndex];
        const fin = coordenadas[currentPathIndex + 1];
        const duracionVuelo = duraciones[currentPathIndex];
        const tiempoEsperaTierra = delays[currentPathIndex];

        let delayVueloTimeout = setTimeout(() => {
            let cuadroActual = 0;
            const cuadrosTotales = 80;

            function frame() {
                cuadroActual++;
                if (cuadroActual <= cuadrosTotales) {
                    const fraccion = cuadroActual / cuadrosTotales;
                    
                    let posicionActual = (google.maps.geometry && google.maps.geometry.spherical) ?
                        google.maps.geometry.spherical.interpolate(inicio, fin, fraccion) : inicio;

                    // ====== 🌟 CORRECCIÓN AQUÍ: Usamos las variables reales de DFS ======
                    if (marcadorAvionActivo && marcadorAvionActivo.getMap() !== null) {
                        marcadorAvionActivo.setPosition(posicionActual);

                        // Vamos dibujando la estela roja dinámicamente a medida que avanza
                        if (lineaRutaActiva) {
                            lineaRutaActiva.getPath().push(posicionActual);
                        }

                        if (google.maps.geometry && google.maps.geometry.spherical) {
                            let rumboActual = google.maps.geometry.spherical.computeHeading(posicionActual, fin);
                            
                            // Buscamos todas las imágenes del avión para rotarlas
                            const imagenesAvion = document.querySelectorAll(`img[src*="${planeIconUrl}"]`);
                            imagenesAvion.forEach(el => {
                                el.style.transform = `rotate(${rumboActual}deg)`;
                                el.style.transformOrigin = 'center center';
                            });
                        }
                    }
                    // ===================================================================

                    let frameTimeout = setTimeout(frame, duracionVuelo / cuadrosTotales);
                    timeoutsYIntervalosDFS.push(frameTimeout);
                } else {
                    currentPathIndex++;
                    procesarSiguienteTramo();
                }
            }

            frame();

        }, tiempoEsperaTierra); 
        
        timeoutsYIntervalosDFS.push(delayVueloTimeout);
    }

    procesarSiguienteTramo();
}





/**
 * Apaga y limpia de raíz todos los procesos concurrentes
 */
function limpiarProcesosAnteriores() {
    timeoutsYIntervalosDFS.forEach(clearTimeout);
    timeoutsYIntervalosDFS = [];
    
    if (lineaRutaActiva) {
        lineaRutaActiva.setMap(null);
        lineaRutaActiva = null;
    }
    if (marcadorAvionActivo) {
        marcadorAvionActivo.setMap(null);
        marcadorAvionActivo = null;
    }
}

window.addEventListener('load', inicializarExploradorDFS);