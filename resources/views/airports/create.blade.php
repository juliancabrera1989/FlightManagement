@extends('layouts.app')
Formulario de creación de Aeropuerto


@section('content')
<div class="container mt-5">
    <div class="row justify-content-center">
            <form action="{{ url('/airports') }}" method="post" enctype="multipart/form-data">
                @csrf
                @include('airports.form', ['modo' => 'Crear'])
            </form>
    </div>
</div>