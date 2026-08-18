import { updateStatusUI } from './ui-updater';
import { animateMarker } from './marker-mover';

/**
 * Limpia todos los procesos activos y resetea los radares
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

    ['distance', 'time', 'cost'].forEach(crit => {
        if(document.getElementById(`clock-${crit}`)) document.getElementById(`clock-${crit}`).innerText = "--:--:--";
        if(document.getElementById(`status-${crit}`)) document.getElementById(`status-${crit}`).innerText = "IDLE";
        if(document.getElementById(`prog-${crit}`)) document.getElementById(`prog-${crit}`).innerText = "0";
    });

    if (window.googleMapInstance) {
        window.ejecutarSimulacion(window.googleMapInstance);
    }
};

/**
 * Motor de despacho y control de escalas/vuelos
 */
window.ejecutarSimulacion = function(map) {
    var centerX = 0, centerY = 0;
    var totalAirportsCount = 0;
    window.avionesActivosEnSimulacion = {};

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

        let flightDurations = [];
        let flightDelays = [];
        let listaAnimacion = []; 
        let pathVuelosData = [];
        let endDelay = 3000;
        let flightsCount = path.flights.length;
        
        if (flightsCount === 1) {
            flightDurations.push(path.flights[0].duration * 5);
            flightDelays.push(((new Date(path.flights[0].departure_time).getTime()) - window.earliest_departure_time.getTime()) / 60000 * 5);
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

                flightDurations.push(flightObj.duration * 5);
                if(currentFlightIdx !== 0) {
                    let prevFlightObj = path.flights[currentFlightIdx - 1];
                    flightDelays.push(((new Date(flightObj.departure_time).getTime()) - new Date(prevFlightObj.arrival_time).getTime()) / 60000 * 5);
                } else {
                    flightDelays.push(((new Date(path.flights[0].departure_time).getTime()) - window.earliest_departure_time.getTime()) / 60000 * 5);
                }
                
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

        animateMarkers(listaAnimacion, flightDurations, flightDelays, endDelay, path.criterion, pathVuelosData);
    });

    if (totalAirportsCount > 0) {
        centerX = centerX / totalAirportsCount; centerY = centerY / totalAirportsCount;
    }
    map.setOptions({ zoom: 2, center: new google.maps.LatLng(centerX, centerY), mapTypeId: google.maps.MapTypeId.TERRAIN });
      
    function animateMarkers(tramosCoords, durations, delays, endDelay, crit, vuelosData) {
        let currentPathIndex = 0;
        let acumuladoCriterio = 0; 

        let prioridadCapa = 10;
        if (crit === 'time') prioridadCapa = 20;
        if (crit === 'cost') prioridadCapa = 30;

        const polylineRastro = new google.maps.Polyline({
            path: [], geodesic: true, strokeOpacity: 0, zIndex: prioridadCapa, map: map
        });
        window.todasLasPolilynesRastro.push(polylineRastro);

        function animateNextMarker() {
            if (currentPathIndex < tramosCoords.length) {
                const originCoords = tramosCoords[currentPathIndex][0];
                const destCoords = tramosCoords[currentPathIndex][1];
                const infoVuelo = vuelosData[currentPathIndex];

                let duration = durations[currentPathIndex] / window.multiplicadorVelocidad;
                let delay = delays[currentPathIndex] / window.multiplicadorVelocidad;

                let minutosEspera = (delays[currentPathIndex] / 5); 
                let mContados = 0;
                updateStatusUI(crit, currentPathIndex === 0 ? "IDLE" : "LAYOVER");

                let waitingInterval = setInterval(() => {
                    if(mContados >= minutosEspera) {
                        clearInterval(waitingInterval);
                    } else {
                        let dateCursor = new Date(window.earliest_departure_time.getTime() + (mContados * 60000));
                        if (currentPathIndex > 0) {
                            let finArriboPrevio = new Date(vuelosData[currentPathIndex-1].arrival_time).getTime();
                            dateCursor = new Date(finArriboPrevio + (mContados * 60000));
                        }
                        updateStatusUI(crit, currentPathIndex === 0 ? "IDLE" : "LAYOVER", dateCursor.toTimeString().split(' ')[0]);
                        mContados += (10 * window.multiplicadorVelocidad); 
                    }
                }, 20);
                window.todosLosIntervalos.push(waitingInterval);

                let delayTimeout = setTimeout(() => {
                    clearInterval(waitingInterval);
                    updateStatusUI(crit, "FLYING");

                    // Invocamos la animación física del módulo marker-mover
                    animateMarker(map, originCoords, destCoords, duration, crit, infoVuelo, acumuladoCriterio, polylineRastro, (valorFinalTramo) => {
                        acumuladoCriterio = valorFinalTramo;
                        currentPathIndex++;
                        animateNextMarker();
                    });
                }, delay);
                window.todosLosTimeouts.push(delayTimeout);


                
            // } else {
            //     updateStatusUI(crit, "ARRIVED");
            //     let endTimeout = setTimeout(()=>{
            //         acumuladoCriterio = 0;
            //         currentPathIndex = 0;
            //         polylineRastro.setPath([]); 
            //         animateNextMarker();
            //     }, endDelay / window.multiplicadorVelocidad);
            //     window.todosLosTimeouts.push(endTimeout);
            // }
            } else {
                // El avión llegó a su destino final
                updateStatusUI(crit, "ARRIVED");

                // 🌟 BARRERA DE CONTROL CENTRAL
                if (!window.controlCicloDijkstra.criteriosFinalizados.includes(crit)) {
                    window.controlCicloDijkstra.criteriosFinalizados.push(crit);
                }

                // ¿Ya llegaron absolutamente todos los criterios a sus metas?
                const todosLlegaron = window.controlCicloDijkstra.criteriosFinalizados.length === window.controlCicloDijkstra.criteriosActivos.length;

                if (todosLlegaron) {
                    // Esperamos 3 segundos con la pantalla estática compartida y reiniciamos TODO junto
                    let endTimeout = setTimeout(() => {
                        window.controlCicloDijkstra.criteriosFinalizados = [];
                        
                        // En lugar de dar vuelta individualmente, gatillamos el reinicio absoluto del motor limpio
                        if (window.reiniciarSimulacion) {
                            window.reiniciarSimulacion();
                        }
                    }, endDelay / window.multiplicadorVelocidad);
                    window.todosLosTimeouts.push(endTimeout);
                } else {
                    // Quedamos en modo espera (IDLE/WAIT) avisando en el radar que este criterio ya cumplió
                    updateStatusUI(crit, "WAITING OTHERS");
                }
            }
        }
        animateNextMarker();
    }
};