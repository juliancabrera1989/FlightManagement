import planeIconUrl from '../../../public/plane.png';

let googleMapInstance = null;
let lineaRutaActiva = null;
let marcadorAvionActivo = null;
let timeoutsYIntervalosDFS = [];

function inicializarExploradorDFS() {
    if (!window.allDfsPaths || window.allDfsPaths.length === 0) return;

    googleMapInstance = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    configurarEventosTarjetas();

    const primeraTarjeta = document.querySelector('.route-card');
    if (primeraTarjeta) {
        primeraTarjeta.click();
    }
}

function configurarEventosTarjetas() {
    document.querySelectorAll('.route-card').forEach(card => {
        card.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-route-index'));
            const pathSeleccionado = window.allDfsPaths[index];

            if (pathSeleccionado) {
                resaltarTarjetaUI(this);
                activarYAnimarCamino(pathSeleccionado);
            }
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

function activarYAnimarCamino(path) {
    limpiarProcesosAnteriores();

    if (!path || !path.airports || path.airports.length === 0) return;

    let coordenadasRuta = path.airports.map(airport => {
        return new google.maps.LatLng(parseFloat(airport.latitude), parseFloat(airport.longitude));
    });

    const bounds = new google.maps.LatLngBounds();
    coordenadasRuta.forEach(coord => bounds.extend(coord));
    googleMapInstance.fitBounds(bounds);

    lineaRutaActiva = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: "#d32f2f",
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map: googleMapInstance,
        zIndex: 999
    });

    let duracionesTramos = [];
    let esperasEscalas = [];

    if (path.flights) {
        path.flights.forEach((flight, idx) => {
            duracionesTramos.push(flight.duration * 5);

            if (idx === 0) {
                esperasEscalas.push(0);
            } else {
                let llegadaPrevio = new Date(path.flights[idx - 1].arrival_time).getTime();
                let salidaActual = new Date(flight.departure_time).getTime();
                let diferenciaMinutos = (salidaActual - llegadaPrevio) / 60000;
                
                esperasEscalas.push(Math.max(0, diferenciaMinutos * 5));
            }
        });
    }

    animarCicloCompletoDFS(coordenadasRuta, duracionesTramos, esperasEscalas, path.flights);
}

function animarCicloCompletoDFS(coordenadas, duraciones, delays, flightsData) {
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
        const duracionVuelo = duraciones[currentPathIndex] || 1000;
        const tiempoEsperaTierra = delays[currentPathIndex] || 0;

        let delayVueloTimeout = setTimeout(() => {
            let cuadroActual = 0;
            const cuadrosTotales = 80;

            function frame() {
                cuadroActual++;
                if (cuadroActual <= cuadrosTotales) {
                    const fraccion = cuadroActual / cuadrosTotales;
                    
                    let posicionActual = (google.maps.geometry && google.maps.geometry.spherical) ?
                        google.maps.geometry.spherical.interpolate(inicio, fin, fraccion) : inicio;

                    if (marcadorAvionActivo && marcadorAvionActivo.getMap() !== null) {
                        marcadorAvionActivo.setPosition(posicionActual);

                        if (lineaRutaActiva) {
                            lineaRutaActiva.getPath().push(posicionActual);
                        }

                        if (google.maps.geometry && google.maps.geometry.spherical) {
                            let rumboActual = google.maps.geometry.spherical.computeHeading(posicionActual, fin);
                            
                            const imagenesAvion = document.querySelectorAll(`img[src*="${planeIconUrl}"]`);
                            imagenesAvion.forEach(el => {
                                el.style.transform = `rotate(${rumboActual}deg)`;
                                el.style.transformOrigin = 'center center';
                            });
                        }
                    }

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