import { updateStatusUI } from './ui-updater';
import { animateMarker } from './marker-mover';

// Estado global
window.multiplicadorVelocidad = window.multiplicadorVelocidad || 1;
window.simulacionPausada = false;
window.tiempoSimulacionActual = null;

// Normalización de fechas para evitar desfases por zona horaria local (UTC)
function parseFechaUTC(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    // Si viene en formato "YYYY-MM-DD HH:mm" o ISO
    return new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
}

/**
 * 1. RELOJ MAESTRO UNIFICADO
 */
function iniciarRelojGlobal() {
    if (!window.earliest_departure_time || !window.latest_arrival_time) return;

    // Forzamos la simulación a iniciar exactamente en UTC
    const tInicio = parseFechaUTC(window.earliest_departure_time);
    const tFin = parseFechaUTC(window.latest_arrival_time);

    window.tiempoSimulacionActual = new Date(tInicio.getTime());
    const clockGlobalEl = document.getElementById('global-sim-clock');

    const tickIntervalMs = 20; // 50 FPS

    let globalInterval = setInterval(() => {
        if (window.simulacionPausada) return;

        if (window.tiempoSimulacionActual >= tFin) {
            window.tiempoSimulacionActual = new Date(tFin.getTime());
            actualizarUIRelojes(tInicio.getTime(), clockGlobalEl);
            clearInterval(globalInterval);
            return;
        }

        // 1 hora simulada por cada 1000ms reales (a velocidad x1.0)
        let avanceMs = (tickIntervalMs / 1000) * 3600000 * window.multiplicadorVelocidad;
        window.tiempoSimulacionActual = new Date(window.tiempoSimulacionActual.getTime() + avanceMs);

        actualizarUIRelojes(tInicio.getTime(), clockGlobalEl);
    }, tickIntervalMs);

    window.todosLosIntervalos.push(globalInterval);
}

function actualizarUIRelojes(inicioMs, clockGlobalEl) {
    if (!window.tiempoSimulacionActual) return;

    // Formateo estricto UTC para que coincida con los itinerarios de la DB
    const isoStr = window.tiempoSimulacionActual.toISOString();
    const fechaFormat = isoStr.split('T')[0];
    const horaFormat = isoStr.split('T')[1].split('.')[0];

    const dateEl = document.getElementById('global-sim-date');
    if (dateEl) {
        dateEl.innerText = fechaFormat;
        if (clockGlobalEl) clockGlobalEl.innerText = horaFormat;
    } else if (clockGlobalEl) {
        clockGlobalEl.innerText = `${fechaFormat} ${horaFormat}`;
    }

    const elapsedEl = document.getElementById('global-sim-elapsed');
    if (elapsedEl) {
        let diffMs = window.tiempoSimulacionActual.getTime() - inicioMs;
        let diffSeg = Math.floor(diffMs / 1000);
        let hrs = String(Math.floor(diffSeg / 3600)).padStart(2, '0');
        let mins = String(Math.floor((diffSeg % 3600) / 60)).padStart(2, '0');
        let secs = String(diffSeg % 60).padStart(2, '0');
        elapsedEl.innerText = `${hrs}:${mins}:${secs}`;
    }
}

/**
 * 2. BOTONES Y CONTROLES
 */
window.reiniciarSimulacion = function() {
    window.todosLosIntervalos.forEach(clearInterval);
    window.todosLosTimeouts.forEach(clearTimeout);
    window.todosLosIntervalos = [];
    window.todosLosTimeouts = [];

    window.todosLosMarcadores.forEach(m => m.setMap(null));
    window.todosLosMarcadores = [];
    window.todasLasPolilynesRastro.forEach(p => p.setMap(null));
    window.todasLasPolilynesRastro = [];
    window.avionesActivosEnSimulacion = {};

    window.simulacionPausada = false;
    const btnPlayPause = document.getElementById('btn-play-pause');
    if (btnPlayPause) {
        btnPlayPause.innerHTML = '⏸️ Pausar';
        btnPlayPause.className = 'btn btn-primary fw-bold';
    }

    if (window.controlCicloDijkstra) {
        window.controlCicloDijkstra.criteriosFinalizados = [];
    }

    ['distance', 'time', 'cost'].forEach(crit => {
        if(document.getElementById(`clock-${crit}`)) document.getElementById(`clock-${crit}`).innerText = "--:--:--";
        if(document.getElementById(`status-${crit}`)) document.getElementById(`status-${crit}`).innerText = "IDLE";
        if(document.getElementById(`prog-${crit}`)) document.getElementById(`prog-${crit}`).innerText = "0";
    });

    if (window.googleMapInstance) {
        window.ejecutarSimulacion(window.googleMapInstance);
    }
};

window.togglePausaSimulacion = function() {
    window.simulacionPausada = !window.simulacionPausada;
    const btn = document.getElementById('btn-play-pause');
    if (btn) {
        btn.innerHTML = window.simulacionPausada ? '▶️ Reanudar' : '⏸️ Pausar';
        btn.className = window.simulacionPausada ? 'btn btn-success fw-bold' : 'btn btn-primary fw-bold';
    }
};

window.actualizarSliderVelocidad = function(val) {
    window.multiplicadorVelocidad = parseFloat(val);
    const txt = document.getElementById('txt-velocidad');
    if (txt) txt.innerText = `x${parseFloat(val).toFixed(1)}`;
};

window.avanzarPasoPaso = function() {
    if (!window.simulacionPausada) {
        window.togglePausaSimulacion();
    }
    if (window.tiempoSimulacionActual) {
        window.tiempoSimulacionActual = new Date(window.tiempoSimulacionActual.getTime() + (10 * 60000));
        const clockGlobalEl = document.getElementById('global-sim-clock');
        if (window.earliest_departure_time) {
            actualizarUIRelojes(parseFechaUTC(window.earliest_departure_time).getTime(), clockGlobalEl);
        }
    }
};

/**
 * 3. CONTROLADOR DE TRAMOS Y ANIMACIONES
 */
window.ejecutarSimulacion = function(map) {
    var centerX = 0, centerY = 0;
    var totalAirportsCount = 0;
    window.avionesActivosEnSimulacion = {};

    iniciarRelojGlobal();

    window.paths.forEach(path => {
        let localPlaneR = [];
        let idxAirport = 0;

        var flightPlanCoordinates = path.airports.map(airport => {
            let latitude = parseFloat(airport.latitude);
            let longitude = parseFloat(airport.longitude);
            centerX += latitude; centerY += longitude; totalAirportsCount++;

            if(idxAirport != 0 && idxAirport != (path.airports.length - 1)) {
                localPlaneR.push({lat: latitude, lng: longitude});
                localPlaneR.push({lat: latitude, lng: longitude});
            } else {
                localPlaneR.push({lat: latitude, lng: longitude});
            }
            idxAirport++;
            return new google.maps.LatLng(latitude, longitude);
        });

        let listaAnimacion = []; 
        let pathVuelosData = [];
        let flightsCount = path.flights.length;
        
        if (flightsCount === 1) {
            if (flightPlanCoordinates[1]) {
                listaAnimacion.push([flightPlanCoordinates[0], flightPlanCoordinates[1]]);
            }
            pathVuelosData.push(path.flights[0]);
        } 
        else {
            let jLocal = 0;
            while (jLocal < localPlaneR.length) {
                let currentFlightIdx = Math.floor(jLocal / 2);
                let flightObj = path.flights[currentFlightIdx];
                if (!flightObj) break;

                if (localPlaneR[jLocal + 0] && localPlaneR[jLocal + 1]) {
                    listaAnimacion.push([
                        new google.maps.LatLng(localPlaneR[jLocal + 0].lat, localPlaneR[jLocal + 0].lng),
                        new google.maps.LatLng(localPlaneR[jLocal + 1].lat, localPlaneR[jLocal + 1].lng)
                    ]);
                }
                pathVuelosData.push(flightObj);
                jLocal = jLocal + 2; 
            }
        }

        animateMarkers(listaAnimacion, path.criterion, pathVuelosData);
    });

    if (totalAirportsCount > 0) {
        centerX = centerX / totalAirportsCount; centerY = centerY / totalAirportsCount;
    }
    map.setOptions({ zoom: 2, center: new google.maps.LatLng(centerX, centerY), mapTypeId: google.maps.MapTypeId.TERRAIN });
      
    function animateMarkers(tramosCoords, crit, vuelosData) {
        let currentPathIndex = 0;
        let acumuladoCriterio = 0; 
        let estaVolando = false;

        let prioridadCapa = 10;
        if (crit === 'time') prioridadCapa = 20;
        if (crit === 'cost') prioridadCapa = 30;

        const polylineRastro = new google.maps.Polyline({
            path: [], geodesic: true, strokeOpacity: 0, zIndex: prioridadCapa, map: map
        });
        window.todasLasPolilynesRastro.push(polylineRastro);

        // Bucle de sincronización sincronizado con el Reloj Global
        let syncLoop = setInterval(() => {
            if (window.simulacionPausada || estaVolando) return;

            if (currentPathIndex >= tramosCoords.length) {
                clearInterval(syncLoop);
                updateStatusUI(crit, "ARRIVED");

                if (!window.controlCicloDijkstra.criteriosFinalizados.includes(crit)) {
                    window.controlCicloDijkstra.criteriosFinalizados.push(crit);
                }

                if (window.controlCicloDijkstra.criteriosFinalizados.length === window.controlCicloDijkstra.criteriosActivos.length) {
                    setTimeout(() => {
                        if (window.reiniciarSimulacion) window.reiniciarSimulacion();
                    }, 3000 / window.multiplicadorVelocidad);
                }
                return;
            }

            const infoVuelo = vuelosData[currentPathIndex];
            const tSalidaVuelo = parseFechaUTC(infoVuelo.departure_time).getTime();
            const tLlegadaVuelo = parseFechaUTC(infoVuelo.arrival_time).getTime();
            const tActual = window.tiempoSimulacionActual ? window.tiempoSimulacionActual.getTime() : 0;

            // 1. Sincronizar el reloj del Radar con el Reloj Global Maestro
            const clockEl = document.getElementById(`clock-${crit}`);
            if (clockEl && window.tiempoSimulacionActual) {
                clockEl.innerText = window.tiempoSimulacionActual.toISOString().split('T')[1].split('.')[0];
            }

            // 2. Control del Estado
            if (tActual < tSalidaVuelo) {
                // Todavía no es hora de salir
                updateStatusUI(crit, currentPathIndex === 0 ? "IDLE" : "LAYOVER");
            } 
            else if (tActual >= tSalidaVuelo && !estaVolando) {
                // Llegó la hora exacta del despegue: Iniciar Vuelo
                estaVolando = true;
                updateStatusUI(crit, "FLYING");

                const originCoords = tramosCoords[currentPathIndex][0];
                const destCoords = tramosCoords[currentPathIndex][1];

                // Calcular duración exacta de la animación según el tiempo de vuelo real
                let duracionSimuladaMs = (tLlegadaVuelo - tSalidaVuelo) / 3600000 * 1000 / window.multiplicadorVelocidad;

                animateMarker(map, originCoords, destCoords, duracionSimuladaMs, crit, infoVuelo, acumuladoCriterio, polylineRastro, (valorFinalTramo) => {
                    acumuladoCriterio = valorFinalTramo;
                    currentPathIndex++;
                    estaVolando = false; // Permite que el syncLoop maneje la escala o el siguiente tramo
                });
            }
        }, 50);

        window.todosLosIntervalos.push(syncLoop);
    }
};