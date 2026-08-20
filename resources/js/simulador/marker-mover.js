import planeIconUrl from '../../../public/plane.png';
import { updateClockDuringFlight, updateProgressUI } from './ui-updater';

/**
 * Anima un marcador (avión) y su polilínea de rastro tramo por tramo
 */
export function animateMarker(map, startPos, endPos, duration, crit, infoVuelo, acumuladoPrevio, polylineRastro, callback) {
    const msPorCuadro = 30; 
    
    // 🌟 ENFOQUE REACTIVO: En lugar de usar pasos fijos, usamos una fracción de 0.0 a 1.0
    let fraction = 0;

    let claveTramo = `${infoVuelo.departure_airport_id}-${infoVuelo.arrival_airport_id}-${infoVuelo.departure_time}`;
    let criteriosCompartidos = (window.tramosGlobalesCompartidos && window.tramosGlobalesCompartidos[claveTramo]) ? window.tramosGlobalesCompartidos[claveTramo] : [crit];
    
    let rumboBase = (google.maps.geometry && google.maps.geometry.spherical) ? 
                    google.maps.geometry.spherical.computeHeading(startPos, endPos) : 0;

    // Configuración de círculos según concurrencia
    let iconConfig = [];
    let grosorLineaFijo = 6; 

    if (criteriosCompartidos.length === 1) {
        iconConfig = [{
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLineaFijo / 2, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(crit), strokeOpacity: 0 },
            offset: '0%', repeat: '6px'
        }];
    } else if (criteriosCompartidos.length === 2) {
        iconConfig = [
            { icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLineaFijo, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[0]), strokeOpacity: 0 }, offset: '0%', repeat: '16px' },
            { icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLineaFijo, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[1]), strokeOpacity: 0 }, offset: '8px', repeat: '16px' }
        ];
    } else {
        iconConfig = [
            { icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLineaFijo, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[0]), strokeOpacity: 0 }, offset: '0%', repeat: '24px' },
            { icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLineaFijo, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[1]), strokeOpacity: 0 }, offset: '8px', repeat: '24px' },
            { icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLineaFijo, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[2]), strokeOpacity: 0 }, offset: '16px', repeat: '24px' }
        ];
    }

    polylineRastro.setOptions({ icons: iconConfig });

    let marker;
    if (!window.avionesActivosEnSimulacion[claveTramo]) {
        marker = new google.maps.Marker({
            position: startPos, 
            map: map,
            icon: {
                url: planeIconUrl,
                size: new google.maps.Size(512, 512),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
                rotation: rumboBase 
            }
        });
        
        marker.claveUnicaTramo = claveTramo; 

        window.todosLosMarcadores.push(marker);
        window.avionesActivosEnSimulacion[claveTramo] = marker;
    } else {
        marker = window.avionesActivosEnSimulacion[claveTramo];
    }

    const depTime = infoVuelo.departure_time ? new Date(infoVuelo.departure_time).getTime() : window.earliest_departure_time.getTime();
    const arrTime = infoVuelo.arrival_time ? new Date(infoVuelo.arrival_time).getTime() : (depTime + (duration * 60 * 1000 / 5));
    const totalVueloMs = arrTime - depTime;

    // Volvemos a calcular la duración base real sin alterar
    const duracionBaseSimulada = duration * (window.multiplicadorVelocidad || 1);

    // SANITIZACIÓN SEGURA DE VALORES (Evita que sume undefined o NaN)
    const costoTramo = parseFloat(infoVuelo.price || infoVuelo.ticket_cost || 0);
    const rawDist = parseFloat(infoVuelo.distance || 0);
    const distTramoKm = rawDist > 10000 ? rawDist / 1000 : rawDist; // Si viene en metros lo pasa a km
    const duracionTramoMins = parseFloat(infoVuelo.duration || 0);

    const runStep = () => {
        if (window.simulacionPausada) {
            let timeoutPausa = setTimeout(runStep, msPorCuadro);
            if (window.todosLosTimeouts) window.todosLosTimeouts.push(timeoutPausa);
            return;
        }

        if (fraction >= 1.0) {
            // Llegada exacta al destino
            if (marker && marker.getMap() !== null) {
                marker.setPosition(endPos);
            }
            polylineRastro.getPath().push(endPos);
            
            if (window.avionesActivosEnSimulacion[claveTramo]) {
                let m = window.avionesActivosEnSimulacion[claveTramo];
                m.setMap(null);
                delete window.avionesActivosEnSimulacion[claveTramo];
            }

            // MANTENEMOS TU ACUMULACIÓN EXACTA ORIGINAL
            let valorAAcumular = 0;
            if (crit === 'cost') valorAAcumular = costoTramo;
            if (crit === 'distance') valorAAcumular = distTramoKm;
            if (crit === 'time') valorAAcumular = duracionTramoMins;

            let nuevoAcumulado = (parseFloat(acumuladoPrevio) || 0) + valorAAcumular;
            
            if (callback) callback(nuevoAcumulado);
        } else {
            let currentPos = (google.maps.geometry && google.maps.geometry.spherical) ? 
                             google.maps.geometry.spherical.interpolate(startPos, endPos, fraction) : startPos;
            
            if (marker && marker.getMap() !== null) {
                marker.setPosition(currentPos);

                if (google.maps.geometry && google.maps.geometry.spherical) {
                    let rumboActual = google.maps.geometry.spherical.computeHeading(currentPos, endPos);
                    
                    if (!marker.elementoHtmlAvion) {
                        const imagenes = document.querySelectorAll(`img[src*="${planeIconUrl}"]`);
                        for (let img of imagenes) {
                            if (!img.dataset.asignado) {
                                img.dataset.asignado = marker.claveUnicaTramo;
                                marker.elementoHtmlAvion = img; 
                                break;
                            }
                        }
                    }

                    if (marker.elementoHtmlAvion) {
                        marker.elementoHtmlAvion.style.transform = `rotate(${rumboActual}deg)`;
                        marker.elementoHtmlAvion.style.transformOrigin = 'center center';
                    }
                }
            }

            polylineRastro.getPath().push(currentPos);

            updateClockDuringFlight(crit, depTime, totalVueloMs, fraction);
            updateProgressUI(crit, acumuladoPrevio, infoVuelo, fraction);

            // 🌟 MATEMÁTICA MAGICA: Avanza la fraccion leyendo el slider actual en este milisegundo
            fraction += (msPorCuadro * (window.multiplicadorVelocidad || 1)) / (duracionBaseSimulada || 1);
            if (fraction > 1.0) fraction = 1.0;

            let siguientePasoTimeout = setTimeout(runStep, msPorCuadro);
            if (window.todosLosTimeouts) window.todosLosTimeouts.push(siguientePasoTimeout);
        }
    };

    let primerPasoTimeout = setTimeout(runStep, msPorCuadro);
    if (window.todosLosTimeouts) window.todosLosTimeouts.push(primerPasoTimeout);
}