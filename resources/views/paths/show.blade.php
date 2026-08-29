{{-- paths.show.blade.php --}}
@extends('layouts.app')

@section('content')
<style>
    /* Animaciones de parpadeo por criterio */
@keyframes planeBlinkDistance {
    0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px #198754); transform: scale(1.1); }
    50% { opacity: 0.3; filter: drop-shadow(0 0 2px #198754); transform: scale(0.9); }
}

@keyframes planeBlinkTime {
    0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px #0d6efd); transform: scale(1.1); }
    50% { opacity: 0.3; filter: drop-shadow(0 0 2px #0d6efd); transform: scale(0.9); }
}

@keyframes planeBlinkCost {
    0%, 100% { opacity: 1; filter: drop-shadow(0 0 8px #dc3545); transform: scale(1.1); }
    50% { opacity: 0.3; filter: drop-shadow(0 0 2px #dc3545); transform: scale(0.9); }
}

/* Clases asociadas */
.plane-waiting-distance { animation: planeBlinkDistance 1.2s infinite ease-in-out; }
.plane-waiting-time     { animation: planeBlinkTime 1.2s infinite ease-in-out; }
.plane-waiting-cost     { animation: planeBlinkCost 1.2s infinite ease-in-out; }


    .radar-card {
        background: #ffffff;
        border-radius: 8px;
        padding: 10px;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0,0,0,0.12);
        border-left: 5px solid #ccc;
    }
    .radar-distance { border-left-color: #198754; }
    .radar-time { border-left-color: #0d6efd; }
    .radar-cost { border-left-color: #dc3545; }

    .solari-text {
        font-size: 0.75rem;
        background: #111;
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
    }

    /* Garantiza coincidencia exacta de alturas */
    .map-container {
        width: 100%;
        min-height: 100%;
        border-radius: 8px;
    }
</style>

<div class="container-fluid px-3 my-3">
    <h2 class="mb-3 text-center fw-bold">Flight Control Radar</h2>

    @if($paths)
    <!-- PANEL DE CONTROL GLOBAL -->
    <div class="card mb-3 shadow-sm border-0">
        <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
            <div class="d-flex align-items-center gap-3 bg-dark text-white px-3 py-2 rounded">
                <span class="fs-4">🌐</span>
                <div class="border-end pe-3 border-secondary">
                    <small class="text-uppercase text-muted d-block fw-bold" style="font-size: 0.65rem;">TIEMPO REAL SIMULADO</small>
                    <div class="font-monospace text-warning fw-bold fs-5">
                        <span id="global-sim-date">----/--/--</span>
                        <span id="global-sim-clock" class="ms-1">--:--:--</span>
                    </div>
                </div>
                <div>
                    <small class="text-uppercase text-muted d-block fw-bold" style="font-size: 0.65rem;">TIEMPO TRANSCURRIDO</small>
                    <span id="global-sim-elapsed" class="font-monospace text-info fw-bold fs-5">00:00:00</span>
                </div>
            </div>

            <div class="d-flex align-items-center gap-2">
                <button id="btn-play-pause" onclick="togglePausaSimulacion()" class="btn btn-primary btn-sm fw-bold px-3">⏸️ Pausar</button>
                <!-- <button onclick="avanzarPasoPaso()" class="btn btn-outline-secondary btn-sm fw-bold">⏩ +10 min</button> -->
                <button onclick="avanzarSiguienteEvento()" class="btn btn-outline-secondary btn-sm fw-bold">⏭️ Step (Evento)</button>
                <button onclick="reiniciarSimulacion()" class="btn btn-outline-danger btn-sm fw-bold">🔄 Reiniciar</button>
            </div>

            <div class="d-flex align-items-center gap-2">
                <label for="speedRange" class="form-label mb-0 fw-bold small">Velocidad:</label>
                <input type="range" class="form-range" id="speedRange" min="0.2" max="5" step="0.1" value="1" style="width: 100px;" oninput="actualizarSliderVelocidad(this.value)">
                <span id="txt-velocidad" class="badge bg-secondary">x1.0</span>
            </div>
        </div>
    </div>

    <!-- SECCIÓN RADARES + MAPA (FLEX STRETCH PARA IGUALAR ALTURA) -->
    <div class="d-flex flex-column flex-lg-row gap-3 align-items-stretch mb-4">
        
        <!-- RADARES (ANCHO FIJO/ADAPTABLE A LA IZQUIERDA) -->
    <div class="d-flex flex-column gap-2" style="flex: 0 0 320px;">
    
    {{-- RADAR DISTANCE --}}
        @if(isset($paths['distance']) && $paths['distance'])
            @php
                $distFirstDep = \Carbon\Carbon::parse($paths['distance']->flights->first()->departure_time);
                $distLastArr = \Carbon\Carbon::parse($paths['distance']->flights->last()->arrival_time);
                $distTotalMinutes = $distFirstDep->diffInMinutes($distLastArr);
            @endphp
            <div class="radar-card radar-distance">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-success small">🟢 RADAR: DISTANCE</span>
                    <span class="badge bg-success" style="font-size: 0.65rem;">[ACTIVE]</span>
                </div>
                <hr class="my-1">
                <div class="small text-dark lh-sm" style="font-size: 0.8rem;">
                    <div>STATUS: <span id="status-distance" class="solari-text text-success">IDLE</span></div>
                    <div>NEXT DEPARTURE: <span id="next-departure-distance" class="fw-bold">--:--</span></div>
                    <hr class="my-1">
                    <div>⏱️ FLIGHT TIME: <span id="flight-time-distance">00:00:00</span></div>
                    <div>⏳ TOTAL TIME: <span id="total-time-distance">00:00</span> / {{ floor($distTotalMinutes / 60) }}:{{ sprintf('%02d', $distTotalMinutes % 60) }} hrs</div>
                    <div>📏 DISTANCE: <span id="dist-prog-distance">0.00</span> / {{ number_format($paths['distance']->total_distance / 1000, 2) }} km</div>
                    <div>💵 ADDED COST: $<span id="cost-prog-distance">0.00</span> / ${{ number_format($paths['distance']->total_cost, 2) }}</div>
                </div>
            </div>
        @endif

        {{-- RADAR TIME --}}
        @if(isset($paths['time']) && $paths['time'])
            @php
                $timeFirstDep = \Carbon\Carbon::parse($paths['time']->flights->first()->departure_time);
                $timeLastArr = \Carbon\Carbon::parse($paths['time']->flights->last()->arrival_time);
                $timeTotalMinutes = $timeFirstDep->diffInMinutes($timeLastArr);
            @endphp
            <div class="radar-card radar-time">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-primary small">🔵 RADAR: TIME</span>
                    <span class="badge bg-primary" style="font-size: 0.65rem;">[ACTIVE]</span>
                </div>
                <hr class="my-1">
                <div class="small text-dark lh-sm" style="font-size: 0.8rem;">
                    <div>STATUS: <span id="status-time" class="solari-text text-primary">IDLE</span></div>
                    <div>NEXT DEPARTURE: <span id="next-departure-time" class="fw-bold">--:--</span></div>
                    <hr class="my-1">
                    <div>⏱️ FLIGHT TIME: <span id="flight-time-time">00:00:00</span></div>
                    <div>⏳ TOTAL TIME: <span id="total-time-time">00:00</span> / {{ floor($timeTotalMinutes / 60) }}:{{ sprintf('%02d', $timeTotalMinutes % 60) }} hrs</div>
                    <div>📏 DISTANCE: <span id="dist-prog-time">0.00</span> / {{ number_format($paths['time']->total_distance / 1000, 2) }} km</div>
                    <div>💵 ADDED COST: $<span id="cost-prog-time">0.00</span> / ${{ number_format($paths['time']->total_cost, 2) }}</div>
                </div>
            </div>
        @endif

        {{-- RADAR COST --}}
        @if(isset($paths['cost']) && $paths['cost'])
            @php
                $costFirstDep = \Carbon\Carbon::parse($paths['cost']->flights->first()->departure_time);
                $costLastArr = \Carbon\Carbon::parse($paths['cost']->flights->last()->arrival_time);
                $costTotalMinutes = $costFirstDep->diffInMinutes($costLastArr);
            @endphp
            <div class="radar-card radar-cost">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-danger small">🔴 RADAR: COST</span>
                    <span class="badge bg-danger" style="font-size: 0.65rem;">[ACTIVE]</span>
                </div>
                <hr class="my-1">
                <div class="small text-dark lh-sm" style="font-size: 0.8rem;">
                    <div>STATUS: <span id="status-cost" class="solari-text text-danger">IDLE</span></div>
                    <div>NEXT DEPARTURE: <span id="next-departure-cost" class="fw-bold">--:--</span></div>
                    <hr class="my-1">
                    <div>⏱️ FLIGHT TIME: <span id="flight-time-cost">00:00:00</span></div>
                    <div>⏳ TOTAL TIME: <span id="total-time-cost">00:00</span> / {{ floor($costTotalMinutes / 60) }}:{{ sprintf('%02d', $costTotalMinutes % 60) }} hrs</div>
                    <div>📏 DISTANCE: <span id="dist-prog-cost">0.00</span> / {{ number_format($paths['cost']->total_distance / 1000, 2) }} km</div>
                    <div>💵 ADDED COST: $<span id="cost-prog-cost">0.00</span> / ${{ number_format($paths['cost']->total_cost, 2) }}</div>
                </div>
            </div>
        @endif

    </div>

        <!-- MAPA EXPANDIDO EN ANCHO Y ALTURA COINCIDENTE -->
        <div class="flex-grow-1">
            <div id="map" class="map-container shadow-sm border"></div>
        </div>

    </div>

    {{-- TABLA DE VUELOS DETALLADA --}}
    @php
        $uniquePaths = [];
        foreach ($paths as $criterion => $path) {
            if ($path) {
                $flightSignature = $path->flights->pluck('id')->implode('-');
                if (!isset($uniquePaths[$flightSignature])) {
                    $uniquePaths[$flightSignature] = ['path' => $path, 'criteria' => []];
                }
                $uniquePaths[$flightSignature]['criteria'][] = $criterion;
            }
        }
    @endphp

    @foreach($uniquePaths as $item)
        @php 
            $path = $item['path']; 
            $criteriaGroup = $item['criteria'];
            $inAirMinutes = 0;
            foreach($path->flights as $f) {
                $inAirMinutes += \Carbon\Carbon::parse($f->departure_time)->diffInMinutes(\Carbon\Carbon::parse($f->arrival_time));
            }
        @endphp

        <div class="card mb-3 shadow-sm border">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-2">
                <h6 class="mb-0 text-warning fw-bold">
                    📌 Ruta: @foreach($criteriaGroup as $crit){{ ucfirst($crit) }} @endforeach
                </h6>
                <div class="d-flex gap-2 small font-monospace">
                    <span class="badge bg-secondary">💵 ${{ number_format($path->total_cost, 2) }}</span>
                    <span class="badge bg-info text-dark">📏 {{ number_format($path->total_distance / 1000, 2) }} km</span>
                    <span class="badge bg-light text-dark">✈️ Air time: {{ floor($inAirMinutes / 60) }}h {{ sprintf('%02d', $inAirMinutes % 60) }}m</span>
                    <span class="badge bg-primary">⏱️ Total time: {{ floor($path->total_time / 60) }}h {{ sprintf('%02d', $path->total_time % 60) }}m</span>
                </div>
            </div>
            <div class="card-body p-2">
                <table class="table table-sm table-hover align-middle mb-0 small">
                    <thead class="table-light">
                        <tr>
                            <th>#</th>
                            <th>Origen</th>
                            <th>Despegue</th>
                            <th>Vuelo</th>
                            <th>Destino</th>
                            <th>Aterrizaje</th>
                            <th>Costo</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($path->flights as $index => $flight)
                            <tr>
                                <td>{{ $index + 1 }}</td>
                                <td><strong>{{ $flight->departureAirport->code }}</strong></td>
                                <td>{{ \Carbon\Carbon::parse($flight->departure_time)->format('d/m/Y H:i') }}</td>
                                <td>Flight #{{ $flight->id }}</td>
                                <td><strong>{{ $flight->arrivalAirport->code }}</strong></td>
                                <td>{{ \Carbon\Carbon::parse($flight->arrival_time)->format('d/m/Y H:i') }}</td>
                                <td class="fw-bold">${{ number_format($flight->ticket_cost, 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    @endforeach

    @endif
</div>

<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=geometry"></script>

@vite([
    'resources/js/simulador/google-maps-helper.js',
    'resources/js/simulador/flight-animator.js'
])

<script type="text/javascript">
    const rawPathsData = @json($paths);

    function initialize() {
        if (typeof window.prepararSimulacion === 'function') {
            window.prepararSimulacion(rawPathsData);
            window.googleMapInstance = new google.maps.Map(document.getElementById('map'));
            window.ejecutarSimulacion(window.googleMapInstance);
        }
    }

    google.maps.event.addDomListener(window, 'load', initialize);
</script>
@endsection