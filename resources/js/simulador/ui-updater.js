// ui-updater.js

export function resetearRadaresUI() {
    ['distance', 'time', 'cost'].forEach(crit => {
        setTxt(`status-${crit}`, 'IDLE');
        setTxt(`next-departure-${crit}`, '--:--');
        setTxt(`flight-time-${crit}`, '00:00:00');
        setTxt(`total-time-${crit}`, '00:00');
        setTxt(`dist-prog-${crit}`, '0.00');
        setTxt(`cost-prog-${crit}`, '0.00');
    });
}

function setTxt(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

export function actualizarRadarUI(crit, datos) {
    if (datos.estado !== undefined) setTxt(`status-${crit}`, datos.estado);
    if (datos.proximaSalida !== undefined) setTxt(`next-departure-${crit}`, datos.proximaSalida);
    if (datos.tiempoVueloStr !== undefined) setTxt(`flight-time-${crit}`, datos.tiempoVueloStr);
    if (datos.tiempoTotalStr !== undefined) setTxt(`total-time-${crit}`, datos.tiempoTotalStr);
    
    if (datos.distanciaProg !== undefined) {
        const distNum = parseFloat(datos.distanciaProg) || 0;
        setTxt(`dist-prog-${crit}`, distNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
    if (datos.costoProg !== undefined) {
        const costoNum = parseFloat(datos.costoProg) || 0;
        setTxt(`cost-prog-${crit}`, costoNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
}


// ui-updater.js

export function updateClockDuringFlight(crit, depTimeMs, totalVueloMs, fraction) {
    // Calcula los milisegundos de este vuelo según la fracción
    const tiempoVueloActualMs = totalVueloMs * fraction;
    
    let totalSeg = Math.floor(tiempoVueloActualMs / 1000);
    let hrs = String(Math.floor(totalSeg / 3600)).padStart(2, '0');
    let mins = String(Math.floor((totalSeg % 3600) / 60)).padStart(2, '0');
    let segs = String(totalSeg % 60).padStart(2, '0');

    const el = document.getElementById(`flight-time-${crit}`);
    if (el) el.innerText = `${hrs}:${mins}:${segs}`;
}

export function updateProgressUI(crit, acumulado, infoVuelo, fraction) {
    // Distancia
    const elDist = document.getElementById(`dist-prog-${crit}`);
    if (elDist && acumulado.distanciaKm !== undefined) {
        elDist.innerText = acumulado.distanciaKm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Costo
    const elCost = document.getElementById(`cost-prog-${crit}`);
    if (elCost && acumulado.costo !== undefined) {
        elCost.innerText = acumulado.costo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Estado del Radar
    const elStatus = document.getElementById(`status-${crit}`);
    if (elStatus) {
        elStatus.innerText = fraction >= 1.0 ? 'LANDED' : 'FLYING';
    }
}


// ui-updater.js

export function mostrarCartelFinSimulacion() {
    let cartel = document.getElementById('sim-finished-alert');
    
    // Si no existe el elemento en la vista, lo crea dinámicamente en pantalla
    if (!cartel) {
        cartel = document.createElement('div');
        cartel.id = 'sim-finished-alert';
        cartel.className = 'alert alert-success alert-dismissible fade show shadow-lg position-fixed bottom-0 end-0 m-4';
        cartel.style.zIndex = '9999';
        cartel.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <span style="font-size: 1.5rem;">🏁</span>
                <div>
                    <strong>¡Simulación Finalizada!</strong><br>
                    Todos los criterios han llegado a destino. Puedes revisar los radares.
                </div>
                <button type="button" class="btn btn-sm btn-outline-dark ms-3" onclick="window.reiniciarSimulacion()">
                    🔄 Reiniciar
                </button>
            </div>
        `;
        document.body.appendChild(cartel);
    } else {
        cartel.style.display = 'block';
    }
}

export function ocultarCartelFinSimulacion() {
    const cartel = document.getElementById('sim-finished-alert');
    if (cartel) {
        cartel.style.display = 'none';
    }
}