@extends('layouts.app')
Formulario de creación de vuelos



@section('content')
<div class="container mt-5">
    <div class="row justify-content-center">
            <form action="{{ url('/flights') }}" method="post" enctype="multipart/form-data">
            @csrf
            @include('flights.form',['modo'=>'Crear'])
            </form>
    </div>
</div>
