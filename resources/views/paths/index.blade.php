@extends('layouts.app')

@section('content')
<div class="d-flex justify-content-center align-items-center min-vh-100 bg-light">
    <div class="card shadow-lg border-0" style="width: 100%; max-width: 500px;">
        <div class="card-body p-4">
            <h3 class="text-center mb-4">Find a Path</h3>

            <form action="{{ route('paths.show') }}" method="POST">
                @csrf

                <div class="mb-3">
                    <label for="departure_airport_id" class="form-label">Departure Airport</label>
                    <select name="departure_airport_id" id="departure_airport_id" class="form-select" required>
                        <option value="">Select Departure</option>
                        @foreach(App\Models\Airport::all() as $airport)
                            <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-3">
                    <label for="arrival_airport_id" class="form-label">Arrival Airport</label>
                    <select name="arrival_airport_id" id="arrival_airport_id" class="form-select" required>
                        <option value="">Select Arrival</option>
                        @foreach(App\Models\Airport::all() as $airport)
                            <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                        @endforeach
                    </select>
                </div>

                <div class="mb-4">
                <div id="criteria-section" class="mb-3">
                    <label class="form-label d-block">Sort Criteria</label>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="criteria[]" value="distance" id="distance">
                        <label class="form-check-label" for="distance">Distance</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="criteria[]" value="cost" id="cost">
                        <label class="form-check-label" for="cost">Cost</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="criteria[]" value="time" id="time">
                        <label class="form-check-label" for="time">Time</label>
                    </div>
                </div>    
                </div>
                <hr class="my-4">
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
// 🔹 Truco extra de UX: Si elige DFS, ocultamos o desactivamos los checkboxes de criterios 
// para que el usuario entienda que va a buscar absolutamente todo.
function toggleCriteria(show) {
    const criteriaSection = document.getElementById('criteria-section');
    if (criteriaSection) {
        if (show) {
            criteriaSection.style.opacity = '1';
            criteriaSection.querySelectorAll('input').forEach(i => i.disabled = false);
        } else {
            criteriaSection.style.opacity = '0.5';
            criteriaSection.querySelectorAll('input').forEach(i => i.disabled = true);
            // Opcional: desmarcar los checkboxes al cambiar a DFS
            criteriaSection.querySelectorAll('input').forEach(i => i.checked = false);
        }
    }
}
</script>
@endsection
