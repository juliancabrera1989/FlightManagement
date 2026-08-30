@extends('layouts.app')

@section('content')
<div class="container my-5 text-center">
    <div class="card shadow p-5 border-0">
        <h1 class="text-success fw-bold">¡CONEXIÓN EXITOSA!</h1>
        <p class="fs-5 text-secondary">Si estás viendo esto, el enlace desde el Home y la ruta <code>paths.index</code> funcionan sin problemas.</p>
        <hr>
        <a href="{{ url('/') }}" class="btn btn-primary btn-lg rounded-pill">Volver al Home</a>
    </div>
</div>
@endsection