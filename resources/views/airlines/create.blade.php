@extends('layouts.app')

@section('title', 'Create Airline')

@section('content')
{{-- 🌟 Agregamos 'flex-grow-1 d-flex align-items-center' a la fila para que use todo el alto disponible del main y centre la tarjeta --}}
<div class="row justify-content-center flex-grow-1 d-flex align-items-center">
    <div class="col-12 col-md-8 col-lg-5">
        
        <form action="{{ url('/airlines') }}" method="post" enctype="multipart/form-data">
            @csrf
            @include('airlines.form', ['modo' => 'Crear'])
        </form>

    </div>
</div>
@endsection