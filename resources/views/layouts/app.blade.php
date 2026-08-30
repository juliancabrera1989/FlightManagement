<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Flight Manager')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
    <script>
    window.Laravel = { baseUrl: "{{ url('/') }}" };
    </script>
    <style>
        /* --- Navbar Styling --- */
     
       .navbar:not(.bg-dark) {
       background: linear-gradient(90deg, #003366, #0055aa);
       transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

        .navbar.scrolled {
            background: #00264d !important;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .navbar-brand img {
            width: 15vw;
        }

        .nav-link {
            color: #f0f0f0 !important;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .nav-link:hover {
            color: #00bfff !important;
        }

        .nav-link.active {
            color: #00bfff !important;
            font-weight: bold;
            border-bottom: 2px solid #00bfff;
        }

        /* --- Footer Styling --- */
        footer {
            background-color: #003366;
            color: #ffffff;
            text-align: center;
            padding: 1.5rem 0;
            margin-top: 4rem;
        }

        footer a {
            color: #00bfff;
            text-decoration: none;
        }

        footer a:hover {
            text-decoration: underline;
        }

body:not(.body-home) {
    padding-top: 70px; /* offset for fixed navbar en páginas internas */
}






        
        body {
    background-color: #f8fafc; 
        }



                    /* --- Estructura Base anti-movimientos raros --- */
            html, body {
                height: 100%;
                margin: 0;
                display: flex;
                flex-direction: column;
            }

            /* El elemento principal va a estirarse para ocupar todo el espacio disponible,
            empujando al footer al fondo automáticamente */
            main.container {
                flex: 1 0 auto; 
                padding-top: 40px; /* Espacio para que el tablero no se pegue a la navbar fija */
                padding-bottom: 40px;
            }

            /* El footer se queda clavado abajo sin importar qué pase arriba */
            footer {
                flex-shrink: 0;
                background-color: #003366;
                color: #ffffff;
                text-align: center;
                padding: 1.5rem 0;
            }


        
        /* Navbar transparent on top, dark after scroll */
.navbar {
    background-color: transparent;
    transition: background-color 0.4s ease, box-shadow 0.3s ease;
}

.navbar.scrolled {
    background-color: #212529 !important; /* Bootstrap dark */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* Active and hover link styles */
.navbar-nav .nav-link {
    color: #ddd !important;
    transition: color 0.3s, border-bottom 0.3s;
    border-bottom: 2px solid transparent;
}

.navbar-nav .nav-link:hover {
    color: #fff !important;
    border-bottom: 2px solid #0dcaf0; /* Bootstrap cyan accent */
}

.navbar-nav .nav-link.active {
    color: #fff !important;
    border-bottom: 2px solid #0dcaf0;
}

/* Footer fix: always stays at bottom */
html, body {
    height: 100%;
}

.page-container {
    min-height: calc(100vh - 100px); /* account for navbar + footer */
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

footer {
    margin-top: auto;
}




        footer {
            background-color: #212529 !important; /* Bootstrap Dark exacto del navbar */
            color: #94a3b8 !important;
            text-align: center;
            padding: 2rem 0;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin-top: 0 !important; /* Evitamos espacios en blanco arriba del footer */
        }
        footer a {
            color: #0dcaf0 !important; /* Cyan a juego con los links activos */
            text-decoration: none;
            transition: color 0.2s ease;
        }
        footer a:hover {
            color: #fff !important;
            text-decoration: underline;
        }













    </style>
    @stack('styles')
</head>
<body class="{{ Request::is('/') || Request::is('public') ? 'body-home' : '' }}">
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top py-2 {{ Request::is('/') || Request::is('public') ? '' : 'bg-dark' }}">
    <a class="navbar-brand" href="{{ url('/') }}">
        <img src="{{ asset('images/flight-manager-logo2.png') }}" alt="Flight Manager Logo">
    </a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">

            {{-- Homepage section links --}}
            @if (request()->is('/') || request()->is('home'))
                <li class="nav-item"><a class="nav-link {{ request()->is('/') ? 'active' : '' }}" href="#intro">Introduction</a></li>
                <li class="nav-item"><a class="nav-link" href="#slideshow">Slideshow</a></li>

                @auth
                    <li class="nav-item"><a class="nav-link" href="#flights">Flights Finder</a></li>
                    <li class="nav-item"><a class="nav-link" href="#pathfinder">Path Finder</a></li>
                @endauth
            @else
                {{-- Internal routes --}}
                <li class="nav-item"><a class="nav-link {{ request()->is('home') ? 'active' : '' }}" href="{{ url('/#intro') }}">Introduction</a></li>
                <li class="nav-item"><a class="nav-link" href="{{ url('/#slideshow') }}">Slideshow</a></li>

                @auth
                    <li class="nav-item"><a class="nav-link" href="{{ url('/#flights') }}">Flights Finder</a></li>
                    <li class="nav-item"><a class="nav-link" href="{{ url('/#pathfinder') }}">Path Finder</a></li>
                @endauth
            @endif

            @auth
                {{-- Create Flight : Admin and employees --}}
                @if(auth()->user()->isEmployee() || auth()->user()->isAdmin())
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('flights.create') ? 'active' : '' }}" href="{{ route('flights.create') }}">
                            <i class="bi bi-plus-circle me-1"></i> Add Flight
                        </a>
                    </li>
                @endif

                {{-- Exclusivo Administrador: Crear Aeropuerto y Aerolínea --}}
                @if(auth()->user()->isAdmin())
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('airports.create') ? 'active' : '' }}" href="{{ route('airports.create') }}">
                            <i class="bi bi-building-add me-1"></i> Add Airport
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link {{ request()->routeIs('airlines.create') ? 'active' : '' }}" href="{{ route('airlines.create') }}">
                            <i class="bi bi-pie-chart me-1"></i> Add Airline
                        </a>
                    </li>
                @endif
            @endauth




            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle {{ request()->is('boards') ? 'active' : '' }}" 
                   href="#" 
                   id="boardsDropdown" 
                   role="button" 
                   data-bs-toggle="dropdown" 
                   aria-expanded="false">
                    Flight Boards
                </a>
                <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-labelledby="boardsDropdown" style="background-color: #212529;">
                    <li>
                        <a class="dropdown-item" href="{{ route('boards') }}">
                            Open Full Interactive Board
                        </a>
                    </li>
                    <li><hr class="dropdown-divider" style="border-color: #444;"></li>
                    <li>
                        <a class="dropdown-item" href="{{ request()->is('/') || request()->is('home') ? '#slideshow' : url('/#slideshow') }}">
                            View Featured Hubs
                        </a>
                    </li>
                </ul>
            </li>
            {{-- Auth links --}}
            {{-- Auth / User Status Badge --}}
            {{-- Auth / User Status Badge --}}
            @guest
                <li class="nav-item">
                    <a class="nav-link {{ request()->is('login') ? 'active' : '' }}" href="{{ route('login') }}">Login</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->is('register') ? 'active' : '' }}" href="{{ route('register') }}">Register</a>
                </li>
            @else
                {{-- Rol & user identificator --}}
                <li class="nav-item d-flex align-items-center ms-lg-3 my-2 my-lg-0">
                    <div class="d-flex align-items-center bg-dark bg-opacity-75 px-3 py-1 rounded-pill border border-secondary me-2">
                        <span class="text-white fw-semibold me-2 small">{{ Auth::user()->name }}</span>
                        
                        @if(Auth::user()->isEmployee() && Auth::user()->employee_type === 'airport')
                            <span class="badge bg-primary text-wrap">
                                ✈️ Airport Emp.: {{ Auth::user()->airport->code ?? 'Assigned' }}
                            </span>
                        @elseif(Auth::user()->isEmployee() && Auth::user()->employee_type === 'airline')
                            <span class="badge bg-info text-dark text-wrap">
                                🛫 Airline Emp.: {{ Auth::user()->airline->name ?? 'Assigned' }}
                            </span>
                        @elseif(Auth::user()->isAdmin())
                            <span class="badge bg-danger text-wrap">
                                🛡️ Admin
                            </span>
                        @else
                            <span class="badge bg-secondary text-wrap">
                                👤 Passenger
                            </span>
                        @endif
                    </div>
                </li>

                {{-- Botón Logout --}}
                <li class="nav-item d-flex align-items-center">
                    <form method="POST" action="{{ route('logout') }}" class="d-inline m-0">
                        @csrf
                        <button type="submit" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                            Logout
                        </button>
                    </form>
                </li>
            @endguest
        </ul>
    </div>
</nav>


{{-- ✅ Page Content (Quitamos la clase container fija para permitir secciones full-width) --}}
{{-- ✅ Contenedor dinámico: Si es el Home no aplica márgenes; si es otra página, mete .container y margen superior --}}
    {{-- <!-- <main class="{{ Request::is('/') || Request::is('home') ? 'w-100 m-0 p-0' : 'container mt-5 pt-4 min-vh-100' }}">
        @yield('content')
    </main> -->

    {{-- ✅ Footer unificado (Cambiado el azul viejo por el gris oscuro del Navbar scrolled) --}}
    <!-- <style>
        footer {
            background-color: #212529 !important; /* Bootstrap Dark exacto del navbar */
            color: #94a3b8 !important;
            text-align: center;
            padding: 2rem 0;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            margin-top: 0 !important; /* Evitamos espacios en blanco arriba del footer */
        }
        footer a {
            color: #0dcaf0 !important; /* Cyan a juego con los links activos */
            text-decoration: none;
            transition: color 0.2s ease;
        }
        footer a:hover {
            color: #fff !important;
            text-decoration: underline;
        }
    </style> -->
    <!-- <footer>
        <p>&copy; {{ date('Y') }} Flight Manager. All rights reserved.</p>
        <p>
            <a href="https://www.facebook.com/" target="_blank">Facebook</a> |
            <a href="https://wa.me/" target="_blank">WhatsApp</a>
        </p>
    </footer> --> 


@if (Request::is('/') || Request::is('home'))
    {{-- Si es el Home, se renderiza tal cual lo tenías originalmente (Perfecto y transparente) --}}
    <main class="w-100 m-0 p-0">
        @yield('content')
    </main>
    <footer>
        <p>&copy; {{ date('Y') }} Flight Manager. All rights reserved.</p>
        <p>
            <a href="https://www.facebook.com/" target="_blank">Facebook</a> |
            <a href="https://wa.me/" target="_blank">WhatsApp</a>
        </p>
    </footer>
@else
    {{-- Estructura Flexbox global externa: el footer queda libre del .container del main --}}
    <div class="d-flex flex-column" style="min-height: calc(100vh - 70px);">
        
        <main class="container mt-5 pt-4 flex-grow-1 d-flex flex-column justify-content-center">
            @yield('content')
        </main>
        
        <footer class="mt-4">
            <p>&copy; {{ date('Y') }} Flight Manager. All rights reserved.</p>
            <p>
                <a href="https://www.facebook.com/" target="_blank">Facebook</a> |
                <a href="https://wa.me/" target="_blank">WhatsApp</a>
            </p>
        </footer>
    </div>
@endif











    {{-- ✅ Scripts --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    {{-- Navbar scroll shadow --}}
    <script>
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    </script>

    {{-- Highlight active section only on home page --}}
    @if (Request::is('/'))
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const sections = document.querySelectorAll("section[id]");
            const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

            window.addEventListener("scroll", () => {
                let current = "";

                sections.forEach(section => {
                    const sectionTop = section.offsetTop - 120;
                    if (pageYOffset >= sectionTop) {
                        current = section.getAttribute("id");
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === "#" + current || link.getAttribute("href") === "/#" + current) {
                        link.classList.add("active");
                    }
                });
            });
        });



    </script>
    @endif
@stack('scripts')
</body>
</html>
