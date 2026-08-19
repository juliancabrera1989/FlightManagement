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

                <!-- Cotas Temporales (Opcionales) -->
                <div class="card bg-white border p-3 mb-3">
                    <label class="form-label fw-bold text-primary mb-2">⏱️ Cotas Temporales (Opcional)</label>
                    <div class="row">
                        <div class="col-md-6 mb-2">
                            <label for="start_date" class="form-label small text-muted">Cota Inferior (Desde)</label>
                            <input type="datetime-local" name="start_date" id="start_date" class="form-control form-control-sm">
                        </div>
                        <div class="col-md-6 mb-2">
                            <label for="end_date" class="form-label small text-muted">Cota Superior (Hasta)</label>
                            <input type="datetime-local" name="end_date" id="end_date" class="form-control form-control-sm">
                        </div>
                    </div>
                    <small class="text-muted fst-italic style="font-size: 0.75rem;">
                        * Sin cotas: busca globalmente.<br>
                        * Solo Cota Superior: parte desde la fecha/hora actual.
                    </small>
                </div>

                <!-- Criterios -->
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
                    <label class="form-label d-block fw-bold">Modo de Búsqueda:</label>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="search_type" id="mode_optimal" value="optimal" checked onclick="toggleCriteria(true)">
                        <label class="form-check-label" for="mode_optimal">⭐ Rutas Óptimas (Dijkstra)</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="search_type" id="mode_all" value="all_alternative" onclick="toggleCriteria(false)">
                        <label class="form-check-label" for="mode_all">🌍 Explorar Todas las Alternativas (DFS)</label>
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
</script>
@endsection