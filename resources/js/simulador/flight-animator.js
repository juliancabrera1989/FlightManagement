// flight-animator.js
import { actualizarRadarUI, resetearRadaresUI } from './ui-updater';
import { animateMarker } from './marker-mover';

window.multiplicadorVelocidad = window.multiplicadorVelocidad || 1;
window.simulacionPausada = false;
window.tiempoSimulacionActual = null;

// Colección global de todos los eventos (despegues y aterrizajes) para el Step
window.cronogramaEventosSimulacion = [];

function parseFechaUTC(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    return new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
}

function formatearHorasMins(ms) {
    if (ms <= 0 || isNaN(ms)) return "00:00";
    let totalSeg = Math.floor(ms / 1000);
    let hrs = String(Math.floor(totalSeg / 3600)).padStart(2, '0');
    let mins = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, '0');
    return `${hrs}:${mins}`;
}

function iniciarRelojGlobal() {
    if (!window.earliest_departure_time || !window.latest_arrival_time) return;

    const tInicio = parseFechaUTC(window.earliest_departure_time);
    const tFin = parseFechaUTC(window.latest_arrival_time);

    window.tiempoSimulacionActual = new Date(tInicio.getTime());
    const clockGlobalEl = document.getElementById('global-sim-clock');

    const tickIntervalMs = 20;

    let globalInterval = setInterval(() => {
        if (window.simulacionPausada) return;

        if (window.tiempoSimulacionActual >= tFin) {
            window.tiempoSimulacionActual = new Date(tFin.getTime());
            actualizarUIRelojes(tInicio.getTime(), clockGlobalEl);
            clearInterval(globalInterval);
            return;
        }

        let avanceMs = (tickIntervalMs / 1000) * 3600000 * window.multiplicadorVelocidad;
        window.tiempoSimulacionActual = new Date(window.tiempoSimulacionActual.getTime() + avanceMs);

        actualizarUIRelojes(tInicio.getTime(), clockGlobalEl);
    }, tickIntervalMs);

    window.todosLosIntervalos.push(globalInterval);
}

function actualizarUIRelojes(inicioMs, clockGlobalEl) {
    if (!window.tiempoSimulacionActual) return;

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

// LÓGICA DEL BOTÓN STEP (Avanzar al siguiente despegue o aterrizaje)
window.avanzarSiguienteEvento = function() {
    if (!window.tiempoSimulacionActual || !window.cronogramaEventosSimulacion.length) return;

    const tActualMs = window.tiempoSimulacionActual.getTime();

    // Buscar el primer evento que sea strictly mayor que el tiempo actual
    const proximoEventoMs = window.cronogramaEventosSimulacion.find(tMs => tMs > tActualMs + 1000);

    if (proximoEventoMs) {
        // Pausar si no estaba pausado
        if (!window.simulacionPausada) {
            window.togglePausaSimulacion();
        }

        // Mover el tiempo exacto al próximo evento
        window.tiempoSimulacionActual = new Date(proximoEventoMs);

        // Forzar actualización visual en los relojes
        const tInicio = parseFechaUTC(window.earliest_departure_time);
        const clockGlobalEl = document.getElementById('global-sim-clock');
        actualizarUIRelojes(tInicio.getTime(), clockGlobalEl);
    }
};

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

    resetearRadaresUI();

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

window.ejecutarSimulacion = function(map) {
    var centerX = 0, centerY = 0;
    var totalAirportsCount = 0;
    window.avionesActivosEnSimulacion = {};
    
    // Recolectar todos los timestamps de despegues y aterrizajes para el Step
    let conjuntoEventos = new Set();

    window.paths.forEach(path => {
        path.flights.forEach(f => {
            const depMs = parseFechaUTC(f.departure_time).getTime();
            const arrMs = parseFechaUTC(f.arrival_time).getTime();
            if (depMs) conjuntoEventos.add(depMs);
            if (arrMs) conjuntoEventos.add(arrMs);
        });
    });

    window.cronogramaEventosSimulacion = Array.from(conjuntoEventos).sort((a, b) => a - b);

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
      

function formatearProximoDespegue(fechaStr) {
    if (!fechaStr || fechaStr === "--:--") return "--:--";
    try {
        const d = parseFechaUTC(fechaStr);
        if (isNaN(d.getTime())) return fechaStr;

        const dia = String(d.getUTCDate()).padStart(2, '0');
        const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
        const anio = d.getUTCFullYear();
        const horas = String(d.getUTCHours()).padStart(2, '0');
        const mins = String(d.getUTCMinutes()).padStart(2, '0');

        return `${dia}/${mes}/${anio} ${horas}:${mins} hs`;
    } catch (e) {
        return fechaStr;
    }
}

function animateMarkers(tramosCoords, crit, vuelosData) {
    let currentPathIndex = 0;
    let estaVolando = false;

    let msTiempoVueloAcumulado = 0;
    let distanciaAcumulada = 0;
    let costoAcumulado = 0;

    const tiempoPrimerDespegue = parseFechaUTC(vuelosData[0].departure_time).getTime();
    const tiempoUltimoAterrizaje = parseFechaUTC(vuelosData[vuelosData.length - 1].arrival_time).getTime();

    let prioridadCapa = 10;
    let colorHex = '#198754'; // Verde (Distance)

    if (crit === 'time') {
        prioridadCapa = 20;
        colorHex = '#0d6efd'; // Azul (Time)
    } else if (crit === 'cost') {
        prioridadCapa = 30;
        colorHex = '#dc3545'; // Rojo (Cost)
    }

    const polylineRastro = new google.maps.Polyline({
        path: [], geodesic: true, strokeOpacity: 0, zIndex: prioridadCapa, map: map
    });
    window.todasLasPolilynesRastro.push(polylineRastro);

    const crearSvgPlane = (opacidad = 1.0) => {
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${colorHex}" fill-opacity="${opacidad}">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
        `);
    };

    const origenInicial = tramosCoords[0][0];

    const waitingMarker = new google.maps.Marker({
        position: origenInicial,
        map: map,
        title: `Esperando despegue (${crit.toUpperCase()})`,
        zIndex: prioridadCapa + 5,
        icon: {
            url: crearSvgPlane(1.0),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
        }
    });

    window.todosLosMarcadores.push(waitingMarker);

    let blinkState = false;
    let lastBlinkTime = Date.now();

    let syncLoop = setInterval(() => {
        if (window.simulacionPausada) return;

        const tActual = window.tiempoSimulacionActual ? window.tiempoSimulacionActual.getTime() : 0;

        let msTiempoTotalConEscalas = 0;
        if (tActual >= tiempoPrimerDespegue) {
            msTiempoTotalConEscalas = Math.min(
                tActual - tiempoPrimerDespegue,
                tiempoUltimoAterrizaje - tiempoPrimerDespegue
            );
        }

        // 1. ARRIVED
        if (currentPathIndex >= tramosCoords.length) {
            const destinoFinalCoords = tramosCoords[tramosCoords.length - 1][1];
            waitingMarker.setPosition(destinoFinalCoords);
            waitingMarker.setOpacity(1.0);
            waitingMarker.setIcon({
                url: crearSvgPlane(1.0),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
            });
            waitingMarker.setVisible(true);

            let tiempoTotalFinal = tiempoUltimoAterrizaje - tiempoPrimerDespegue;

            actualizarRadarUI(crit, {
                estado: "ARRIVED",
                proximaSalida: "--:--",
                tiempoVueloStr: formatearHorasMins(msTiempoVueloAcumulado),
                tiempoTotalStr: formatearHorasMins(tiempoTotalFinal),
                distanciaProg: distanciaAcumulada,
                costoProg: costoAcumulado
            });

            if (!window.controlCicloDijkstra.criteriosFinalizados.includes(crit)) {
                window.controlCicloDijkstra.criteriosFinalizados.push(crit);
            }

            if (window.controlCicloDijkstra.criteriosFinalizados.length === window.controlCicloDijkstra.criteriosActivos.length) {
                clearInterval(syncLoop);
                setTimeout(() => {
                    if (window.reiniciarSimulacion) window.reiniciarSimulacion();
                }, 3000 / window.multiplicadorVelocidad);
            }
            return;
        }

        const infoVuelo = vuelosData[currentPathIndex];
        const tSalidaVuelo = parseFechaUTC(infoVuelo.departure_time).getTime();
        const tLlegadaVuelo = parseFechaUTC(infoVuelo.arrival_time).getTime();
        const originCoords = tramosCoords[currentPathIndex][0];

        // 2. IDLE / LAYOVER
        if (tActual < tSalidaVuelo) {
            const fechaHoraSalida = formatearProximoDespegue(infoVuelo.departure_time);

            waitingMarker.setPosition(originCoords);
            waitingMarker.setVisible(true);

            const now = Date.now();
            if (now - lastBlinkTime > 500) {
                blinkState = !blinkState;
                lastBlinkTime = now;
                waitingMarker.setOpacity(blinkState ? 1.0 : 0.25);
            }

            actualizarRadarUI(crit, {
                estado: currentPathIndex === 0 ? "IDLE" : "LAYOVER",
                proximaSalida: fechaHoraSalida,
                tiempoVueloStr: formatearHorasMins(msTiempoVueloAcumulado),
                tiempoTotalStr: formatearHorasMins(msTiempoTotalConEscalas),
                distanciaProg: distanciaAcumulada,
                costoProg: costoAcumulado
            });
        } 
        // 3. FLYING
        else if (tActual >= tSalidaVuelo) {
            waitingMarker.setVisible(false);

            const destCoords = tramosCoords[currentPathIndex][1];

            let distTramoKm = 0;
            if (google.maps.geometry && google.maps.geometry.spherical) {
                distTramoKm = google.maps.geometry.spherical.computeDistanceBetween(originCoords, destCoords) / 1000;
            }

            let duracionTramoMs = tLlegadaVuelo - tSalidaVuelo;
            let fraccionTramo = Math.min(1, Math.max(0, (tActual - tSalidaVuelo) / duracionTramoMs));

            let costoTramoActual = parseFloat(infoVuelo.ticket_cost || infoVuelo.price || infoVuelo.cost || 0);
            let costoMostrar = costoAcumulado + costoTramoActual;
            let distanciaMostrar = distanciaAcumulada + (distTramoKm * fraccionTramo);
            let msEnVueloEsteTramo = (tLlegadaVuelo - tSalidaVuelo) * fraccionTramo;

            let proximoDespegueStr = "ÚLTIMO TRAMO";
            if (currentPathIndex + 1 < vuelosData.length) {
                proximoDespegueStr = formatearProximoDespegue(vuelosData[currentPathIndex + 1].departure_time);
            }

            actualizarRadarUI(crit, {
                estado: "FLYING",
                proximaSalida: proximoDespegueStr,
                tiempoVueloStr: formatearHorasMins(msTiempoVueloAcumulado + msEnVueloEsteTramo),
                tiempoTotalStr: formatearHorasMins(msTiempoTotalConEscalas),
                distanciaProg: distanciaMostrar,
                costoProg: costoMostrar
            });

            if (!estaVolando) {
                estaVolando = true;
                let duracionAnimacionMs = (tLlegadaVuelo - tSalidaVuelo) / 3600000 * 1000 / window.multiplicadorVelocidad;

                animateMarker(map, originCoords, destCoords, duracionAnimacionMs, crit, infoVuelo, 0, polylineRastro, () => {
                    msTiempoVueloAcumulado += (tLlegadaVuelo - tSalidaVuelo);
                    distanciaAcumulada += distTramoKm;
                    costoAcumulado += costoTramoActual;

                    currentPathIndex++;
                    estaVolando = false;
                });
            }
        }
    }, 50);

    window.todosLosIntervalos.push(syncLoop);
}
};