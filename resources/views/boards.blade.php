@extends('layouts.app')

@section('title', 'Live Flight Boards')

@section('content')

{{-- Limpiamos el w-100 m-0 para que use el contenedor natural que le acabamos de programar al layout --}}
<div class="row justify-content-center">
    <div class="col-12">
        
        <div class="card shadow-sm border-0 p-3 p-md-4 mb-5 bg-white" style="border-radius: 12px; min-height: 600px;">
            
            <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
                <div>
                    <h1 class="h2 mb-1 text-dark" style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px;">
                        🛫 Airport Flight Status
                    </h1>
                    <p class="text-muted small mb-0">Select a destination to display current arrival and departure monitors.</p>
                </div>
                <div class="badge bg-info text-white px-3 py-2 fw-bold">Live System</div>
            </div>

            <div id="board-root" class="w-100"></div>
            
        </div>
        
    </div>
</div>
<!-- <script>
    window.INITIAL_AIRPORT_ID = {{ $airportId ?? 'null' }};
    
    // 🎯 Le pasamos a React la URL exacta de la carpeta public de Laravel
    window.APP_URL = "{{ url('/') }}"; 
</script> -->
<script>
    window.Laravel = { baseUrl: "{{ url('/') }}" };
    window.INITIAL_AIRPORT_ID = {{ $airportId ?? 'null' }};
    window.APP_URL = "{{ url('/') }}"; 
</script>
    @viteReactRefresh
    @vite(['resources/js/boards/main.jsx'])
@endsection