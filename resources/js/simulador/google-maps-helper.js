/**
 * Flight Control Radar - Módulo de Inicialización y Estado Global
 */

// Variables y controladores globales dinámicos de la simulación
window.paths = [];
window.earliest_departure_time = undefined;
window.latest_arrival_time = undefined;

window.multiplicadorVelocidad = 1.0; 
window.todosLosIntervalos = [];
window.todosLosTimeouts = [];
window.todosLosMarcadores = [];
window.todasLasPolilynesRastro = []; 
window.googleMapInstance = null;

// Estructuras para la concurrencia espacial de aviones comerciales
window.tramosGlobalesCompartidos = {}; 
window.avionesActivosEnSimulacion = {};

/**
 * Procesa el JSON crudo enviado por Laravel para calcular 
 * los desfases de tiempo y los tramos físicos compartidos.
 */


// 🌟 NUEVO: Control central de sincronización de ciclos para Dijkstra
window.controlCicloDijkstra = {
    criteriosActivos: [],
    criteriosFinalizados: []
};



window.prepararSimulacion = function(rawPathsData) {
    const A = 0;
    let B;

    Object.entries(rawPathsData).forEach(([criterion, path]) => {
        if (!path) return; 
        B = path.flights.length === 1 ? A : path.flights.length - 1;
        
        if (window.earliest_departure_time === undefined) {
            window.earliest_departure_time = new Date(path.flights[A].departure_time);
        } else {
            let current_dep = new Date(path.flights[A].departure_time);
            if(window.earliest_departure_time > current_dep) window.earliest_departure_time = current_dep;
        }

        if (window.latest_arrival_time === undefined) {
            window.latest_arrival_time = new Date(path.flights[B].arrival_time);
        } else {
            let current_arr = new Date(path.flights[B].arrival_time);
            if(window.latest_arrival_time < current_arr) window.latest_arrival_time = current_arr;
        }

        path.criterion = criterion;
        window.paths.push(path);

        // Mapeamos qué criterios comparten exactamente el mismo avión físico comercial
        path.flights.forEach(f => {
            let claveTramo = `${f.departure_airport_id}-${f.arrival_airport_id}-${f.departure_time}`;
            if(!window.tramosGlobalesCompartidos[claveTramo]) {
                window.tramosGlobalesCompartidos[claveTramo] = [];
            }
            if(!window.tramosGlobalesCompartidos[claveTramo].includes(criterion)) {
                window.tramosGlobalesCompartidos[claveTramo].push(criterion);
            }
        });

        // 🌟 NUEVO: Guardamos el criterio en la lista de activos
        window.controlCicloDijkstra.criteriosActivos.push(criterion);
    });
};

/**
 * Vinculado al evento oninput del slider de Blade
 */
window.actualizarSliderVelocidad = function(val) {
    window.multiplicadorVelocidad = parseFloat(val);
    const txtVel = document.getElementById('txt-velocidad');
    if (txtVel) {
        txtVel.innerText = 'x' + window.multiplicadorVelocidad.toFixed(1);
    }
};

/**
 * Determina el color hexadecimal estricto de cada rastro
 */
window.obtenerColorPorCriterio = function(crit) {
    if (crit === 'distance') return '#198754'; // Verde
    if (crit === 'time') return '#0d6efd';     // Azul
    return '#dc3545';                          // Rojo
};