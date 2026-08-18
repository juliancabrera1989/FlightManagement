@extends('layouts.app')

@section('title', 'Home')

@section('content')

  <section id="intro" class="text-center text-white" 
    style="background: url('../resources/images/plane2.gif') center center / cover no-repeat; height: 100vh; display: flex; align-items: center; justify-content: center; padding-top: 70px;">
    <div class="bg-dark bg-opacity-25 p-4 rounded">
      <h1 class="display-4 fw-bold">Welcome to the Flight Management System</h1>
      <p class="lead">Manage global flights, find routes, and simulate journeys in real-time.</p>
    </div>
  </section>

  <section id="slideshow" class="py-5 text-white text-center" style="background-color: #212529;">
    <div class="container mb-4">
      <h2 style="font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 1px;">Explore Global Airport Hubs</h2>
      <p class="text-muted">Quick access to live boards for our most visited international airports.</p>
    </div>

    <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel" style="max-width: 900px; margin: 0 auto; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div class="carousel-inner">
        <div class="carousel-item active" style="position: relative; height: 450px;">
          <img src="../resources/images/JFK.png" class="d-block w-100 h-100" style="object-fit: cover;" alt="JFK Airport">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.85));"></div>
          <div class="carousel-caption d-none d-md-block" style="bottom: 40px; z-index: 10;">
            <h3 class="display-6 fw-bold">JFK • New York 🇺🇸</h3>
            <p>John F. Kennedy International Airport - Transatlantic Flight Core.</p>
            <a href="{{ route('boards') }}?airport=JFK" class="btn btn-info text-white fw-bold px-4">View JFK Live Board</a>
          </div>
        </div>

        <div class="carousel-item" style="position: relative; height: 450px;">
          <img src="../resources/images/HND.png" class="d-block w-100 h-100" style="object-fit: cover;" alt="Haneda Airport">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.85));"></div>
          <div class="carousel-caption d-none d-md-block" style="bottom: 40px; z-index: 10;">
            <h3 class="display-6 fw-bold">HND • Tokyo 🇯🇵</h3>
            <p>Haneda International Airport - High-Tech Asian Connectivity Hub.</p>
            <a href="{{ route('boards') }}?airport=HND" class="btn btn-info text-white fw-bold px-4">View Haneda Live Board</a>
          </div>
        </div>

        <div class="carousel-item" style="position: relative; height: 450px;">
          <img src="../resources/images/HTW.png" class="d-block w-100 h-100" style="object-fit: cover;" alt="Heathrow Airport">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.85));"></div>
          <div class="carousel-caption d-none d-md-block" style="bottom: 40px; z-index: 10;">
            <h3 class="display-6 fw-bold">LHR • London 🇬🇧</h3>
            <p>Heathrow Airport - The Gateway to Europe and Beyond.</p>
            <a href="{{ route('boards') }}?airport=LHR" class="btn btn-info text-white fw-bold px-4">View Heathrow Live Board</a>
          </div>
        </div>
      </div>

      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </section>

  @auth
    <section id="flights" class="py-5 text-center text-white" 
      style="background: linear-gradient(rgba(33, 37, 41, 0.88), rgba(33, 37, 41, 0.88)), url('/images/terminal-pantallas.jpg') center/cover no-repeat;">
      <div class="container py-4">
        <div class="p-5 rounded-4" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); max-width: 800px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 class="fw-bold mb-3" style="font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 1px;">Flights Finder</h2>
          <p class="lead text-white-50 mb-4">Explore all available flights, filter by airports, and view schedules in real-time.</p>
          <a href="{{ route('flights.index') }}" class="btn btn-cyan btn-lg px-5 fw-bold text-white" style="background-color: #0dcaf0;">Go to Flights</a>
        </div>
      </div>
    </section>

    <section id="pathfinder" class="py-5 text-center text-white" 
      style="background: linear-gradient(rgba(33, 37, 41, 0.88), rgba(33, 37, 41, 0.88)), url('/images/avion-nubes.jpg') center/cover no-repeat;">
      <div class="container py-4">
        <div class="p-5 rounded-4" style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); max-width: 800px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <h2 class="fw-bold mb-3" style="font-family: 'Bebas Neue', sans-serif; font-size: 2.5rem; letter-spacing: 1px;">Path Finder</h2>
          <p class="lead text-white-50 mb-4">Find the best routes between airports using our intelligent pathfinding algorithm.</p>
          <a href="{{ route('paths.index') }}" class="btn btn-outline-info btn-lg px-5 fw-bold">Find Paths</a>
        </div>
      </div>
    </section>
  @endauth

@endsection