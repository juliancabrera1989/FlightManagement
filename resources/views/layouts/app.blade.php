<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title', 'Flight Manager')</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head><body>

  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
    <a class="navbar-brand">Flight Manager</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ml-auto">

  {{-- Check if we are on the homepage --}}
  @if (request()->is('/') || request()->is('home'))
      {{-- On the homepage → internal links (scrolling) --}}
      <li class="nav-item"><a class="nav-link" href="#intro">Introduction</a></li>
      <li class="nav-item"><a class="nav-link" href="#slideshow">Slideshow</a></li>

      @auth
        <li class="nav-item"><a class="nav-link" href="#flights">Flights Finder</a></li>
        <li class="nav-item"><a class="nav-link" href="#pathfinder">Path Finder</a></li>
      @endauth
  @else
      {{-- On other pages → full links that bring back to home --}}
      <li class="nav-item"><a class="nav-link" href="{{ url('/#intro') }}">Introduction</a></li>
      <li class="nav-item"><a class="nav-link" href="{{ url('/#slideshow') }}">Slideshow</a></li>

      @auth
        <li class="nav-item"><a class="nav-link" href="{{ url('/#flights') }}">Flights Finder</a></li>
        <li class="nav-item"><a class="nav-link" href="{{ url('/#pathfinder') }}">Path Finder</a></li>
      @endauth
  @endif
        @auth
          @if(auth()->user()->role === 'employee')
            <li class="nav-item"><a class="nav-link" href="{{ route('flights.create') }}">Add Flight</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('airports.create') }}">Add Airport</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ route('airlines.create') }}">Add Airline</a></li>
          @endif

          <li class="nav-item">
            <form method="POST" action="{{ route('logout') }}">
              @csrf
              <button type="submit" class="btn btn-link nav-link">Logout</button>
            </form>
          </li>
        @endauth

        @guest
          <!-- Show login/register only for guests -->
          <li class="nav-item"><a class="nav-link" href="{{ route('login') }}">Login</a></li>
          <li class="nav-item"><a class="nav-link" href="{{ route('register') }}">Register</a></li>
        @endguest
      </ul>
    </div>
  </nav>

  <div class="container-fluid mt-5 pt-4">
    @yield('content')
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
