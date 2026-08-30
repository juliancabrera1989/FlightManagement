import planeIconUrl from '../../../public/plane.png';
import { updateClockDuringFlight, updateProgressUI } from './ui-updater';

/**
 * Anima un marcador (avión) y su polilínea de rastro tramo por tramo
 */
export function animateMarker(map, startPos, endPos, duration, crit, infoVuelo, acumuladoPrevio, polylineRastro, callback) {
    const msPorCuadro = 30; 

    const claveTramo = `${infoVuelo.departure_airport_id}-${infoVuelo.arrival_airport_id}`;
    const claveUnicaInstancia = `${claveTramo}-${infoVuelo.departure_time}`;
    const claveCompartidaHorario = `${claveTramo}-${infoVuelo.departure_time}`;

    const criteriosCompartidos = (window.tramosGlobalesCompartidos && window.tramosGlobalesCompartidos[claveCompartidaHorario])
        ? window.tramosGlobalesCompartidos[claveCompartidaHorario]
        : [crit];

    const totalConcurrencia = (window.concurrenciaTramosGlobal && window.concurrenciaTramosGlobal[claveTramo]) ? window.concurrenciaTramosGlobal[claveTramo] : 1;
    const ordenRutas = (window.ordenTramosGlobal && window.ordenTramosGlobal[claveTramo]) ? window.ordenTramosGlobal[claveTramo] : [crit];
    let posicionIndice = ordenRutas.indexOf(crit);
    if (posicionIndice === -1) posicionIndice = 0;

    let grosorLinea = 6;
    if (totalConcurrencia === 2) {
        grosorLinea = (posicionIndice === 0) ? 10 : 5;
    } else if (totalConcurrencia >= 3) {
        if (posicionIndice === 0) grosorLinea = 12;
        else if (posicionIndice === 1) grosorLinea = 8;
        else grosorLinea = 4;
    }

    const zIndexPrioridad = 100 + (posicionIndice * 10);

    let iconConfig = [];
    if (criteriosCompartidos.length === 1) {
        const colorRuta = window.obtenerColorPorCriterio ? window.obtenerColorPorCriterio(crit) : '#198754';
        const patronPuntosDistancia = `${Math.max(3, grosorLinea * 0.8)}px`;
        iconConfig = [{
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: grosorLinea / 2,
                fillOpacity: 1,
                fillColor: colorRuta,
                strokeOpacity: 0
            },
            offset: '0%',
            repeat: patronPuntosDistancia
        }];
    } else if (criteriosCompartidos.length === 2) {
        iconConfig = [
            {
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLinea / 2, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[0]), strokeOpacity: 0 },
                offset: '0%', repeat: '16px'
            },
            {
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLinea / 2, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[1]), strokeOpacity: 0 },
                offset: '8px', repeat: '16px'
            }
        ];
    } else {
        iconConfig = [
            {
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLinea / 2, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[0]), strokeOpacity: 0 },
                offset: '0%', repeat: '24px'
            },
            {
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLinea / 2, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[1]), strokeOpacity: 0 },
                offset: '8px', repeat: '24px'
            },
            {
                icon: { path: google.maps.SymbolPath.CIRCLE, scale: grosorLinea / 2, fillOpacity: 1, fillColor: window.obtenerColorPorCriterio(criteriosCompartidos[2]), strokeOpacity: 0 },
                offset: '16px', repeat: '24px'
            }
        ];
    }

    polylineRastro.setOptions({ 
        icons: iconConfig,
        zIndex: zIndexPrioridad
    });

    const rumboBase = (google.maps.geometry && google.maps.geometry.spherical) ? 
                     google.maps.geometry.spherical.computeHeading(startPos, endPos) : 0;

    let marker;
    if (!window.avionesActivosEnSimulacion[claveUnicaInstancia]) {
        marker = new google.maps.Marker({
            position: startPos, 
            map: map,
            zIndex: 3000 + zIndexPrioridad,
            icon: {
                url: planeIconUrl,
                size: new google.maps.Size(512, 512),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20),
                rotation: rumboBase 
            }
        });
        
        marker.claveUnicaTramo = claveUnicaInstancia; 
        window.todosLosMarcadores.push(marker);
        window.avionesActivosEnSimulacion[claveUnicaInstancia] = marker;
    } else {
        marker = window.avionesActivosEnSimulacion[claveUnicaInstancia];
        marker.setZIndex(3000 + zIndexPrioridad);
    }

    // --- TIMINGS EN TIEMPO REAL/UTC ---
    const depTime = parseFechaUTC(infoVuelo.departure_time).getTime();
    const arrTime = parseFechaUTC(infoVuelo.arrival_time).getTime();
    const totalVueloMs = arrTime - depTime;

    const costoTramo = parseFloat(infoVuelo.price || infoVuelo.ticket_cost || 0);
    const rawDist = parseFloat(infoVuelo.distance || 0);
    const distTramoKm = rawDist > 10000 ? rawDist / 1000 : rawDist;
    const duracionTramoMins = parseFloat(infoVuelo.duration || 0);

    const runStep = () => {
        if (window.simulacionPausada) {
            const timeoutPausa = setTimeout(runStep, msPorCuadro);
            if (window.todosLosTimeouts) window.todosLosTimeouts.push(timeoutPausa);
            return;
        }

        // Sincronización con el tiempo global
        const tActual = window.tiempoSimulacionActual ? window.tiempoSimulacionActual.getTime() : depTime;
        let fraction = (tActual - depTime) / totalVueloMs;
        fraction = Math.min(1.0, Math.max(0.0, fraction));

        if (fraction >= 1.0) {
            if (marker && marker.getMap() !== null) {
                marker.setPosition(endPos);
            }
            
            if (polylineRastro && polylineRastro.getPath) {
                const path = polylineRastro.getPath();
                if (path.getLength() > 1) {
                    path.setAt(1, endPos);
                } else {
                    path.push(endPos);
                }
            }
            
            if (window.avionesActivosEnSimulacion[claveUnicaInstancia]) {
                const m = window.avionesActivosEnSimulacion[claveUnicaInstancia];
                m.setMap(null);
                delete window.avionesActivosEnSimulacion[claveUnicaInstancia];
            }

            let valorAAcumular = 0;
            if (crit === 'cost') valorAAcumular = costoTramo;
            if (crit === 'distance') valorAAcumular = distTramoKm;
            if (crit === 'time') valorAAcumular = duracionTramoMins;

            const nuevoAcumulado = (parseFloat(acumuladoPrevio) || 0) + valorAAcumular;
            if (callback) callback(nuevoAcumulado);
        } else {
            const currentPos = (google.maps.geometry && google.maps.geometry.spherical) ? 
                              google.maps.geometry.spherical.interpolate(startPos, endPos, fraction) : startPos;
            
            if (marker && marker.getMap() !== null) {
                marker.setPosition(currentPos);

                if (google.maps.geometry && google.maps.geometry.spherical) {
                    const rumboActual = google.maps.geometry.spherical.computeHeading(currentPos, endPos);
                    
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

            if (polylineRastro && polylineRastro.getPath) {
                const path = polylineRastro.getPath();
                if (path.getLength() < 2) {
                    path.push(currentPos);
                } else {
                    path.setAt(1, currentPos);
                }
            }

            updateClockDuringFlight(crit, depTime, totalVueloMs, fraction);
            updateProgressUI(crit, acumuladoPrevio, infoVuelo, fraction);

            const siguientePasoTimeout = setTimeout(runStep, msPorCuadro);
            if (window.todosLosTimeouts) window.todosLosTimeouts.push(siguientePasoTimeout);
        }
    };

    const primerPasoTimeout = setTimeout(runStep, msPorCuadro);
    if (window.todosLosTimeouts) window.todosLosTimeouts.push(primerPasoTimeout);
}

function parseFechaUTC(dateStr) {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    return new Date(dateStr.replace(' ', 'T') + (dateStr.includes('Z') ? '' : 'Z'));
}