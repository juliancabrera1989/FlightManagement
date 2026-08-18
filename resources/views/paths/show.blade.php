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
        width: 280px;
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
        font-size: 1.1rem;
        background: #111;
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        text-align: center;
    }
    /* Estilo para el slider */
    .speed-slider {
        width: 200px;
        cursor: pointer;
    }
</style>

<div class="container my-5">
    <h1 class="mb-4 text-center">Flight Control Radar</h1>

    @if($paths)
        {{-- 🎛️ BOTONERA CON SLIDER DE PRECISIÓN --}}
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-4 mb-3 bg-dark text-white p-3 rounded shadow-sm">
            <button onclick="reiniciarSimulacion()" class="btn btn-warning fw-bold px-4">
                🔄 Reiniciar Radar
            </button>
            <div class="vr bg-secondary d-none d-md-block" style="height: 30px;"></div>
            <div class="d-flex align-items-center gap-3">
                <label for="slider-vel" class="form-label mb-0 fw-bold text-warning">🎚️ Control de Ritmo:</label>
                <input type="range" class="form-range speed-slider" id="slider-vel" min="0.2" max="40" step="0.2" value="1" oninput="actualizarSliderVelocidad(this.value)">
                <span class="badge bg-light text-dark fs-6 font-monospace px-3 py-2" style="min-width: 80px;">
                    <span id="txt-velocidad">x1.0</span>
                </span>
            </div>
        </div>

        <div class="position-relative">
            <div id="map" style="height: 60vh; width: 100%;" class="mb-5 rounded shadow"></div>
            
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
                        <div class="my-1">STATUS: <span id="status-distance" class="solari-text" style="color: #198754;">IDLE</span></div>
                        <div>📊 PROG: <span id="prog-distance">0</span> / <span id="total-distance-val">{{ number_format($paths['distance']->total_distance / 1000, 2) }}</span> km</div>
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
                        <div class="my-1">STATUS: <span id="status-time" class="solari-text" style="color: #0d6efd;">IDLE</span></div>
                        <div>📊 PROG: <span id="prog-time">--:--</span> / <span id="total-time-val">{{ gmdate('H:i', $paths['time']->total_time * 60) }}</span> hrs</div>
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
                        <div class="my-1">STATUS: <span id="status-cost" class="solari-text" style="color: #dc3545;">IDLE</span></div>
                        <div>💰 BUDGET: $<span id="prog-cost">0</span> / $<span id="total-cost-val">{{ $paths['cost']->total_cost }}</span></div>
                    </div>
                </div>
                @endif
            </div>
        </div>

        {{-- Código Blade de contingencia e info (Se mantiene igual) --}}
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
            @endphp
            <div class="card mb-4 shadow-sm">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">
                        @foreach($criteriaGroup as $index => $crit)
                            Sorted by {{ ucfirst($crit) }}{{ $index < count($criteriaGroup) - 1 ? ' & ' : '' }}
                        @endforeach
                    </h4>
                </div>
                <div class="card-body">
                    <h5 class="card-title">Airports</h5>
                    <ul class="list-group list-group-flush mb-3">
                        @foreach($path->airports as $airport)
                            <li class="list-group-item">
                                <strong>{{ $airport->name }}</strong> ({{ $airport->code }}) <br>
                                <small class="text-muted">Lat: {{ $airport->latitude }}, Lng: {{ $airport->longitude }}</small>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        @endforeach
    @else
        <p class="alert alert-warning">No paths found.</p>
    @endif
</div>

{{-- API Externa de Google Maps --}}
<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=geometry"></script>

{{-- Inyección modular e inteligente de los módulos mediante Vite --}}
@vite([
    'resources/js/simulador/google-maps-helper.js',
    'resources/js/simulador/flight-animator.js'
])

{{-- Orquestador local nativo --}}
<script type="text/javascript">
    // Convertimos de forma segura la variable de Laravel a JSON para Javascript
    const rawPathsData = @json($paths);

    /**
     * Inicializador gatillado automáticamente por el DomListener de Google
     */
    function initialize() {
        // 1. Procesamos datos y variables estructurales del radar
        window.prepararSimulacion(rawPathsData);

        // 2. Montamos la instancia física en el contenedor HTML
        window.googleMapInstance = new google.maps.Map(document.getElementById('map'));
        
        // 3. Encendemos el motor de simulación gráfica cuadro por cuadro
        window.ejecutarSimulacion(window.googleMapInstance);
    }

    // Escuchamos la carga completa de la ventana para disparar la inicialización
    google.maps.event.addDomListener(window, 'load', initialize);
</script>