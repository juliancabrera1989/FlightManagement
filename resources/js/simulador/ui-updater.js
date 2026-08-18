/**
 * Módulo encargado exclusivamente de actualizar la interfaz gráfica (HTML) de los radares
 */

export function updateStatusUI(crit, status, textSimTime = null) {
    const statusElem = document.getElementById(`status-${crit}`);
    const clockElem = document.getElementById(`clock-${crit}`);
    
    if (statusElem) statusElem.innerText = status;
    if (clockElem && textSimTime) clockElem.innerText = textSimTime;
}

export function updateProgressUI(crit, acumuladoPrevio, infoVuelo, fraction) {
    const progElem = document.getElementById(`prog-${crit}`);
    if (!progElem) return;

    if (crit === 'cost') {
        const precioTramo = parseFloat(infoVuelo.price || 0);
        progElem.innerText = (acumuladoPrevio + (precioTramo * fraction)).toFixed(2);
    } else if (crit === 'distance') {
        const distanciaTramoKm = parseFloat(infoVuelo.distance || 0) / 1000;
        progElem.innerText = (acumuladoPrevio + (distanciaTramoKm * fraction)).toFixed(1);
    } else if (crit === 'time') {
        const duracionTramoMin = parseFloat(infoVuelo.duration || 0);
        const minTotales = acumuladoPrevio + (duracionTramoMin * fraction);
        
        const horas = String(Math.floor(minTotales / 60)).padStart(2, '0');
        const minutos = String(Math.floor(minTotales % 60)).padStart(2, '0');
        progElem.innerText = `${horas}:${minutos}`;
    }
}

export function updateClockDuringFlight(crit, depTime, totalVueloMs, fraction) {
    const clockElem = document.getElementById(`clock-${crit}`);
    if (clockElem) {
        let currentSimMs = depTime + (totalVueloMs * fraction);
        clockElem.innerText = new Date(currentSimMs).toTimeString().split(' ')[0];
    }
}