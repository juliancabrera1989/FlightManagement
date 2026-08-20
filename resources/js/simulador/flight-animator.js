// flight-animator.js
import { actualizarRadarUI, resetearRadaresUI } from './ui-updater';
import { animateMarker } from './marker-mover';

window.multiplicadorVelocidad = window.multiplicadorVelocidad || 1;
window.simulacionPausada = false;
window.tiempoSimulacionActual = null;

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
        let estaVolando = false;

        // Métricas Acumuladas
        let msTiempoVueloAcumulado = 0;
        let distanciaAcumulada = 0;
        let costoAcumulado = 0;

        // Tiempos referencia de esta ruta específica
        const tiempoPrimerDespegue = parseFechaUTC(vuelosData[0].departure_time).getTime();
        const tiempoUltimoAterrizaje = parseFechaUTC(vuelosData[vuelosData.length - 1].arrival_time).getTime();

        let prioridadCapa = 10;
        if (crit === 'time') prioridadCapa = 20;
        if (crit === 'cost') prioridadCapa = 30;

        const polylineRastro = new google.maps.Polyline({
            path: [], geodesic: true, strokeOpacity: 0, zIndex: prioridadCapa, map: map
        });
        window.todasLasPolilynesRastro.push(polylineRastro);

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

            // 1. SI LA RUTA YA TERMINÓ TODOS SUS TRAMOS
            if (currentPathIndex >= tramosCoords.length) {
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

            // 2. ESTADO IDLE / LAYOVER (ESPERANDO DESPEGUE DE ESTE TRAMO)
            if (tActual < tSalidaVuelo) {
                // Muestra Fecha + Hora completa del despegue que se viene
                const fechaHoraSalida = infoVuelo.departure_time || "--:--";

                actualizarRadarUI(crit, {
                    estado: currentPathIndex === 0 ? "IDLE" : "LAYOVER",
                    proximaSalida: fechaHoraSalida,
                    tiempoVueloStr: formatearHorasMins(msTiempoVueloAcumulado),
                    tiempoTotalStr: formatearHorasMins(msTiempoTotalConEscalas),
                    distanciaProg: distanciaAcumulada,
                    costoProg: costoAcumulado
                });
            } 
            // 3. INICIO Y PROGRESO DE VUELO (FLYING)
            else if (tActual >= tSalidaVuelo) {
                const originCoords = tramosCoords[currentPathIndex][0];
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

                // Determinar Fecha/Hora del PRÓXIMO despegue mientras vuela
                let proximoDespegueStr = "--:--";
                if (currentPathIndex + 1 < vuelosData.length) {
                    // Si hay una escala/tramo siguiente, mostrar su fecha y hora
                    proximoDespegueStr = vuelosData[currentPathIndex + 1].departure_time;
                } else {
                    // Es el último tramo de la ruta
                    proximoDespegueStr = "ÚLTIMO TRAMO";
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