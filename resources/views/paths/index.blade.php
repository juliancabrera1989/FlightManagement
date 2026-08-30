@extends('layouts.app')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card shadow border-0 p-4">
                <h3 class="mb-4">Find a Path</h3>

                <form action="{{ route('paths.show') }}" method="POST">
                    @csrf

                    <div class="mb-3">
                        <label class="form-label fw-bold">Departure Airport</label>
                        <select name="departure_airport_id" class="form-select" required>
                            <option value="">Select Departure</option>
                            @foreach(App\Models\Airport::all() as $airport)
                                <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Arrival Airport</label>
                        <select name="arrival_airport_id" class="form-select" required>
                            <option value="">Select Arrival</option>
                            @foreach(App\Models\Airport::all() as $airport)
                                <option value="{{ $airport->id }}">{{ $airport->name }} ({{ $airport->code }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Search Mode</label>
                        <div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="search_type" id="mode_optimal" value="optimal" checked onclick="toggleCriteria(true)">
                                <label class="form-check-label" for="mode_optimal">Optimal (Dijkstra)</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="search_type" id="mode_all" value="all_alternative" onclick="toggleCriteria(false)">
                                <label class="form-check-label" for="mode_all">All (DFS)</label>
                            </div>
                        </div>
                    </div>

                    <div id="criteria-section" class="mb-3">
                        <label class="form-label fw-bold">Sort Criteria</label>
                        <div class="d-flex gap-3">
                            <div class="form-check"><input class="form-check-input" type="checkbox" name="criteria[]" value="distance" checked><label class="form-check-label">Distance</label></div>
                            <div class="form-check"><input class="form-check-input" type="checkbox" name="criteria[]" value="cost" checked><label class="form-check-label">Cost</label></div>
                            <div class="form-check"><input class="form-check-input" type="checkbox" name="criteria[]" value="time" checked><label class="form-check-label">Time</label></div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100">Find Path</button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function toggleCriteria(show) {
    const s = document.getElementById('criteria-section');
    if (s) {
        s.style.opacity = show ? '1' : '0.5';
        s.querySelectorAll('input').forEach(i => i.disabled = !show);
    }
}
</script>
@endsection