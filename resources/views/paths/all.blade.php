@extends('layouts.app')

@section('content')
<div class="container-fluid my-4">
    <h1 class="mb-4 text-center">🌍 Alternative Routes Explorer (DFS)</h1>

    @if($allPaths->isEmpty())
        <div class="alert alert-warning text-center">
            No se encontraron rutas disponibles con transbordos lógicos para este destino.
        </div>
    @else
        <div class="row">
            {{-- Panel Izquierdo: Listado de Tarjetas DFS --}}
            <div class="col-md-5" style="max-height: 75vh; overflow-y: auto;" id="dfs-cards-container">
                <h4 class="mb-3">Available Combinations ({{ $allPaths->count() }})</h4>
                
                @foreach($allPaths as $index => $path)
                    <div class="card mb-3 shadow-sm route-card" 
                         id="card-{{ $index }}" 
                         style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;"
                         data-route-index="{{ $index }}">
                        
                        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                            <span class="fw-bold">Option #{{ $index + 1 }}</span>
                            <span class="badge bg-primary">{{ $path->transhipments }} Escalas</span>
                        </div>
                        
                        <div class="card-body">
                            <div class="d-flex align-items-center justify-content-between mb-3 fw-bold text-secondary">
                                <span>{{ $path->airports[0]->code }}</span>
                                <hr class="flex-grow-1 mx-2" style="border-top: 2px dashed #ccc;">
                                @if($path->transhipments > 0)
                                    <span class="text-muted small">via 
                                        @foreach(array_slice($path->airports, 1, -1) as $m)
                                            {{ $m->code }} 
                                        @endforeach
                                    </span>
                                    <hr class="flex-grow-1 mx-2" style="border-top: 2px dashed #ccc;">
                                @endif
                                <span>{{ end($path->airports)->code }}</span>
                            </div>

                            <div class="row text-center bg-light p-2 rounded">
                                <div class="col-4">
                                    <small class="text-muted d-block">Price</small>
                                    <span class="fw-bold text-success">${{ number_format($path->total_cost, 2) }}</span>
                                </div>
                                <div class="col-4">
                                    <small class="text-muted d-block">Distance</small>
                                    <span class="fw-bold text-primary">{{ round($path->total_distance) }} km</span>
                                </div>
                                <div class="col-4">
                                    <small class="text-muted d-block">Duration</small>
                                    <span class="fw-bold text-danger">{{ floor($path->total_time / 60) }}h {{ $path->total_time % 60 }}m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>

            {{-- Panel Derecho: El mapa global --}}
            <div class="col-md-7">
                <div id="map" style="height: 75vh; width: 100%;" class="rounded shadow"></div>
            </div>
        </div>
    @endif
</div>

{{-- Dependencias y Scripts vía Vite --}}
<script src="https://maps.googleapis.com/maps/api/js?key={{ env('GOOGLE_MAPS_API_KEY') }}&libraries=geometry"></script>

@vite([
    'resources/js/simulador/dfs-explorer.js'
])

<script type="text/javascript">
    // Inyección de la colección de rutas encontradas por el algoritmo de Laravel
    window.allDfsPaths = @json($allPaths);
</script>
@endsection