{{-- paths.show.blade.php --}}
@extends('layouts.app')

@section('content')
<style>
    .sim-overlay-container {
        position: absolute;
        bottom: 40px;
        left: 40px;
        z-index: 1050;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
    }
    .radar-card {
        pointer-events: auto;
        width: 290px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 8px;
        padding: 12px;
        font-family: 'Courier New', Courier, monospace;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 6px solid #ccc;
        transition: all 0.3s ease;
    }
    .radar-distance { border-left-color: #198754; color: #198754; }
    .radar-time { border-left-color: #0d6efd; color: #0d6efd; }
    .radar-cost { border-left-color: #dc3545; color: #dc3545; }

    .solari-text {
        font-size: 1rem;
        background: #111;
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        text-align: center;
    }
    .speed-slider {
        width: 180px;
        cursor: pointer;
    }
</style>

<div class="container my-5">
    <h1 class="mb-4 text-center">Flight Control Radar</h1>

    @if($paths)
<!-- BANNER Y CONTROLES DE LA SIMULACIÓN -->
<div class="card mb-3 shadow-sm border-0">
    <div class="card-body d-flex flex-wrap align-items-center justify-content-between gap-3 py-2">
        
        <!-- Reloj Global: Fecha + Hora Absoluta + Tiempo Transcurrido -->
        <div class="d-flex align-items-center gap-3 bg-dark text-white px-3 py-2 rounded">
            <span class="fs-3">🌐</span>
            <div class="border-end pe-3 border-secondary">
                <small class="text-uppercase text-muted d-block fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">TIEMPO REAL SIMULADO</small>
                <div class="font-monospace text-warning fw-bold fs-5">
                    <span id="global-sim-date">----/--/--</span>
                    <span id="global-sim-clock" class="ms-1">--:--:--</span>
                </div>
            </div>
            <div>
                <small class="text-uppercase text-muted d-block fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">TIEMPO TRANSCURRIDO</small>
                <span id="global-sim-elapsed" class="font-monospace text-info fw-bold fs-5">00:00:00</span>
            </div>
        </div>

        <!-- Botonera de Control -->
        <div class="d-flex align-items-center gap-2">
            <button id="btn-play-pause" onclick="togglePausaSimulacion()" class="btn btn-primary fw-bold">
                ⏸️ Pausar
            </button>
            <button onclick="avanzarPasoPaso()" class="btn btn-outline-secondary fw-bold">
                ⏩ +10 min
            </button>
            <button onclick="reiniciarSimulacion()" class="btn btn-outline-danger fw-bold">
                🔄 Reiniciar
            </button>
        </div>

        <!-- Slider de Velocidad (Soporta desde 0.2x) -->
        <div class="d-flex align-items-center gap-2">
            <label for="speedRange" class="form-label mb-0 fw-bold small">Velocidad:</label>
            <input type="range" class="form-range" id="speedRange" min="0.2" max="5" step="0.1" value="1" style="width: 100px;" oninput="actualizarSliderVelocidad(this.value)">
            <span id="txt-velocidad" class="badge bg-secondary">x1.0</span>
        </div>

    </div>
</div>

        <div class="position-relative">
            <div id="map" style="height: 60vh; width: 100%;" class="mb-5 rounded shadow"></div>
            
            {{-- 📊 TARJETAS OVERLAY (SIMULADOR) --}}
            <div class="sim-overlay-container">
                @if(isset($paths['distance']) && $paths['distance'])
                <div id="overlay-distance" class="radar-card radar-distance">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span>🟢 RADAR: DISTANCE</span>
                        <small class="badge bg-success text-white">ACTIVE</small>
                    </div>
                    <hr class="my-1 border-success">
                    <div class="small text-dark">
                        <div>⏱️ SIM TIME: <span id="clock-distance">--:--:--</span></div>
                        <div>🛫 PRÓX. SALIDA: <span id="next-dep-distance" class="fw-bold text-success">--:--</span></div>
                        <div class="my-1">ESTADO: <span id="status-distance" class="solari-text text-success">IDLE</span></div>
                        <div>📊 PROGRESO: <span id="prog-distance">0</span> / <span id="total-distance-val">{{ number_format($paths['distance']->total_distance / 1000, 2) }}</span> km</div>
                    </div>
                </div>
                @endif

                @if(isset($paths['time']) && $paths['time'])
                <div id="overlay-time" class="radar-card radar-time">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span>🔵 RADAR: TIME</span>
                        <small class="badge bg-primary text-white">ACTIVE</small>
                    </div>
                    <hr class="my-1 border-primary">
                    <div class="small text-dark">
                        <div>⏱️ SIM TIME: <span id="clock-time">--:--:--</span></div>
                        <div>🛫 PRÓX. SALIDA: <span id="next-dep-time" class="fw-bold text-primary">--:--</span></div>
                        <div class="my-1">ESTADO: <span id="status-time" class="solari-text text-primary">IDLE</span></div>
                        <div>📊 PROGRESO: <span id="prog-time">00:00</span> / <span id="total-time-val">{{ floor($paths['time']->total_time / 60) }}:{{ sprintf('%02d', $paths['time']->total_time % 60) }}</span> hrs</div>
                    </div>
                </div>
                @endif

                @if(isset($paths['cost']) && $paths['cost'])
                <div id="overlay-cost" class="radar-card radar-cost">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span>🔴 RADAR: COST</span>
                        <small class="badge bg-danger text-white">ACTIVE</small>
                    </div>
                    <hr class="my-1 border-danger">
                    <div class="small text-dark">
                        <div>⏱️ SIM TIME: <span id="clock-cost">--:--:--</span></div>
                        <div>🛫 PRÓX. SALIDA: <span id="next-dep-cost" class="fw-bold text-danger">--:--</span></div>
                        <div class="my-1">ESTADO: <span id="status-cost" class="solari-text text-danger">IDLE</span></div>
                        <div>📊 PRESUPUESTO: $<span id="prog-cost">0.00</span> / $<span id="total-cost-val">{{ number_format($paths['cost']->total_cost, 2) }}</span></div>
                    </div>
                </div>
                @endif
            </div>
        </div>

        {{-- DESGLOSE DETALLADO DE RUTAS ENCONTRADAS --}}
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

                // Colores dinámicos del Header según criterio para matchear el radar
                $headerBorderColor = 'border-secondary';
                if (in_array('distance', $criteriaGroup)) {
                    $headerBorderColor = 'border-success border-3';
                } elseif (in_array('cost', $criteriaGroup)) {
                    $headerBorderColor = 'border-danger border-3';
                } elseif (in_array('time', $criteriaGroup)) {
                    $headerBorderColor = 'border-primary border-3';
                }

                // Cálculo de minutos reales en el aire
                $inAirMinutes = 0;
                foreach($path->flights as $f) {
                    $inAirMinutes += \Carbon\Carbon::parse($f->departure_time)->diffInMinutes(\Carbon\Carbon::parse($f->arrival_time));
                }
            @endphp

            <div class="card mb-4 shadow-sm {{ $headerBorderColor }}">
                <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                    <h5 class="mb-0 text-warning fw-bold">
                        📌 
                        @foreach($criteriaGroup as $index => $crit)
                            Sorted by {{ ucfirst($crit) }}{{ $index < count($criteriaGroup) - 1 ? ' & ' : '' }}
                        @endforeach
                    </h5>
                    
                    {{-- BADGES REORGANIZADOS Y CON COLORES NEUTROS/INFORMATIVOS --}}
                    <div class="d-flex gap-2 small font-monospace flex-wrap">
                        <span class="badge bg-secondary fs-6">
                            💵 Costo: ${{ number_format($path->total_cost, 2) }}
                        </span>
                        <span class="badge bg-info text-dark fs-6">
                            📏 Distancia: {{ number_format($path->total_distance / 1000, 2) }} km
                        </span>
                        <span class="badge bg-light text-dark fs-6 border">
                            ✈️ En Aire: {{ floor($inAirMinutes / 60) }}h {{ sprintf('%02d', $inAirMinutes % 60) }}m
                        </span>
                        <span class="badge bg-purple text-white fs-6" style="background-color: #6f42c1;">
                            ⏱️ Ventana Itinerario: {{ floor($path->total_time / 60) }}h {{ sprintf('%02d', $path->total_time % 60) }}m
                        </span>
                    </div>
                </div>

                <div class="card-body">
                    <h6 class="card-subtitle mb-3 text-muted fw-bold">Itinerario y Escalas:</h6>
                    
                    <div class="table-responsive">
                        <table class="table table-hover align-middle small">
                            <thead class="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Origen</th>
                                    <th>Despegue</th>
                                    <th>Vuelo</th>
                                    <th>Destino</th>
                                    <th>Aterrizaje</th>
                                    <th>Costo</th>
                                    <th>Detalle Tramo</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($path->flights as $index => $flight)
                                    <tr>
                                        <td><span class="badge bg-secondary rounded-pill">{{ $index + 1 }}</span></td>
                                        <td>
                                            <strong>{{ $flight->departureAirport->code }}</strong><br>
                                            <small class="text-muted">{{ $flight->departureAirport->name }}</small>
                                        </td>
                                        <td><span class="badge bg-outline-dark text-dark border px-2 py-1">{{ \Carbon\Carbon::parse($flight->departure_time)->format('d/m/Y H:i') }}</span></td>
                                        <td>
                                            <span class="fw-bold text-dark" 
                                                  data-bs-toggle="tooltip" 
                                                  data-bs-html="true" 
                                                  title="<b>Vuelo #{{ $flight->id }}</b><br>Salida: {{ $flight->departure_time }}<br>Llegada: {{ $flight->arrival_time }}">
                                                ✈️ Flight #{{ $flight->id }}
                                            </span>
                                        </td>
                                        <td>
                                            <strong>{{ $flight->arrivalAirport->code }}</strong><br>
                                            <small class="text-muted">{{ $flight->arrivalAirport->name }}</small>
                                        </td>
                                        <td><span class="badge bg-outline-dark text-dark border px-2 py-1">{{ \Carbon\Carbon::parse($flight->arrival_time)->format('d/m/Y H:i') }}</span></td>
                                        <td class="fw-bold text-dark">${{ number_format($flight->ticket_cost, 2) }}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-dark" 
                                                    data-bs-toggle="popover" 
                                                    data-bs-trigger="hover focus"
                                                    title="Detalle del Tramo" 
                                                    data-bs-content="Costo: ${{ $flight->ticket_cost }} | Salida: {{ $flight->departure_time }} | Llegada: {{ $flight->arrival_time }}">
                                                🔍 Info
                                            </button>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        @endforeach
    @else
        <p class="alert alert-warning text-center">No paths found for the selected criteria.</p>
    @endif
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new bootstrap.Popover(popoverTriggerEl);
        });
    });
</script>

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