@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="card shadow-lg border-0" style="width: 100%; max-width: 550px;">
        <div class="card-body p-4">
            <h3 class="text-center mb-4">Find a Path</h3>

            <form action="{{ route('paths.show') }}" method="POST">
                @csrf

                <!-- Aeropuertos -->
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="departure_airport_id" class="form-label fw-bold">Departure Airport</label>
                        <select name="departure_airport_id" id="departure_airport_id" class="form-select" required>
                            <option value="">Select Departure</option>
                            @foreach(App\Models\Airport::all() as $airport)
                                <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label for="arrival_airport_id" class="form-label fw-bold">Arrival Airport</label>
                        <select name="arrival_airport_id" id="arrival_airport_id" class="form-select" required>
                            <option value="">Select Arrival</option>
                            @foreach(App\Models\Airport::all() as $airport)
                                <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <!-- Datetime bounds (Optional) -->
                <div class="card bg-white border p-3 mb-3">
                    <label class="form-label fw-bold text-primary mb-2">⏱️ Date/time bounds (Optional)</label>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label for="start_date" class="form-label small text-muted">Lower bound(From)</label>
                            <input type="datetime-local" name="start_date" id="start_date" class="form-control form-control-sm">
                        </div>
                        <div class="col-md-6 mb-2">
                            <label for="end_date" class="form-label small text-muted"> Upper bound(Until)</label>
                            <input type="datetime-local" name="end_date" id="end_date" class="form-control form-control-sm">
                        </div>
                    </div>
                    <small class="text-muted fst-italic" style="font-size: 0.75rem;">
                        * No Bounds. Search limitlessly<br>
                        * Only upper bound: it starts on the current date/time.
                    </small>
                </div>

                <!-- Criteria -->
                <div id="criteria-section" class="mb-3">
                    <label class="form-label d-block fw-bold">Sort Criteria</label>
                    <div class="d-flex gap-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="criteria[]" value="distance" id="distance" checked>
                            <label class="form-check-label" for="distance">Distance</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="criteria[]" value="cost" id="cost" checked>
                            <label class="form-check-label" for="cost">Cost</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="criteria[]" value="time" id="time" checked>
                            <label class="form-check-label" for="time">Time</label>
                        </div>
                    </div>
                </div>    

                <hr class="my-3">

                <!-- Modo de Búsqueda -->
                <div class="mb-4">
                    <label class="form-label d-block fw-bold">Search mode:</label>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="search_type" id="mode_optimal" value="optimal" checked onclick="toggleCriteria(true)">
                        <label class="form-check-label" for="mode_optimal">⭐ Optimal routes (Dijkstra)</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="search_type" id="mode_all" value="all_alternative" onclick="toggleCriteria(false)">
                        <label class="form-check-label" for="mode_all">🌍 Explore all the alternatives (DFS)</label>
                    </div>
                </div>

                <div class="d-grid">
                    <button type="submit" class="btn btn-primary btn-lg">Find Path</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function toggleCriteria(show) {
    const criteriaSection = document.getElementById('criteria-section');
    if (criteriaSection) {
        if (show) {
            criteriaSection.style.opacity = '1';
            criteriaSection.querySelectorAll('input').forEach(i => i.disabled = false);
        } else {
            criteriaSection.style.opacity = '0.5';
            criteriaSection.querySelectorAll('input').forEach(i => i.disabled = true);
        }
    }
}

// Sincronizar la interfaz tan pronto como la página se cargue o se recupere del historial
document.addEventListener('DOMContentLoaded', syncUIOnLoad);
window.addEventListener('pageshow', syncUIOnLoad);

function syncUIOnLoad() {
    const modeOptimal = document.getElementById('mode_optimal');
    if (modeOptimal) {
        // Aplica la lógica dependiendo de cuál radio está seleccionado actualmente en el navegador
        toggleCriteria(modeOptimal.checked);
    }
}
</script>
@endsection