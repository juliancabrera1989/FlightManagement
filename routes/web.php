<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AirlineController;
use App\Http\Controllers\AirportController;
use App\Http\Controllers\FlightController;
use App\Http\Controllers\PathController;
use App\Http\Controllers\AuthController;
use App\Http\Middleware\EnsureEmployee;

/*
|--------------------------------------------------------------------------
| 1. RUTAS PÚBLICAS (Accesibles para cualquiera)
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return view('welcome');
});

Route::get('/boards', function (Illuminate\Http\Request $request) {
    $airportId = null;
    $urlCode = $request->query('airport');

    if ($urlCode && !is_numeric($urlCode)) {
        $airport = \App\Models\Airport::where('code', strtoupper($urlCode))->first();
        if ($airport) {
            $airportId = $airport->id;
        }
    }

    return view('boards', compact('airportId'));
})->name('boards');

// API pública
Route::prefix('api')->group(function () {
    Route::get('/countries', [AirportController::class, 'countries']);
    Route::get('/airports', [AirportController::class, 'airportsByCountry']);
    Route::get('/flights', [FlightController::class, 'filter']);
    Route::get('/airlines', [AirlineController::class, 'getAirlinesApi']);
});

/*
|--------------------------------------------------------------------------
| 2. RUTAS SOLO PARA INVITADOS (Bloqueadas si YA iniciaste sesión)
|--------------------------------------------------------------------------
*/
Route::middleware(['guest'])->group(function () {
    Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login.form');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::get('/register', [AuthController::class, 'showRegisterForm'])->name('register.form');
    Route::post('/register', [AuthController::class, 'register'])->name('register');
});

/*
|--------------------------------------------------------------------------
| 3. CAPA DE SEGURIDAD 1: Solo Usuarios Registrados (Pasajeros y Empleados)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Cerrar sesión solo posible estando autenticado
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Vistas principales y buscadores
    Route::get('/flights', [FlightController::class, 'index'])->name('flights.index');
    // Route::get('paths', [PathController::class, 'index'])->name('paths.index');
    Route::get('/paths', function () {
    return view('paths.index');
})->name('paths.index');
    Route::post('paths', [PathController::class, 'show'])->name('paths.show');

    /*
    |--------------------------------------------------------------------------
    | 4. CAPA DE SEGURIDAD 2: Solo Empleados (Anidado dentro de auth)
    |--------------------------------------------------------------------------
    */
    Route::middleware([EnsureEmployee::class])->group(function () {
        
        // Gestión de Vuelos (Creación y Eliminación)
        Route::get('/flights/create', [FlightController::class, 'create'])->name('flights.create');
        Route::post('/flights', [FlightController::class, 'store'])->name('flights.store');
        Route::delete('/flights/{flight}', [FlightController::class, 'destroy'])->name('flights.destroy');
        Route::get('/flights/{flight}/edit', [FlightController::class, 'edit'])->name('flights.edit');
        Route::put('/flights/{flight}', [FlightController::class, 'update'])->name('flights.update');
        
        // Gestión de Aerolíneas (Creación)
        Route::get('/airlines/create', [AirlineController::class, 'create'])->name('airlines.create');
        Route::post('/airlines', [AirlineController::class, 'store'])->name('airlines.store');
        
        // Gestión de Aeropuertos (Creación)
        Route::get('/airports/create', [AirportController::class, 'create'])->name('airports.create');
        Route::post('/airports', [AirportController::class, 'store'])->name('airports.store');
        
    });

    // Rutas tipo Resource para ver listados/detalles internos
    Route::resource('airlines', AirlineController::class)->except(['create', 'store', 'edit', 'update', 'destroy']);
    Route::resource('airports', AirportController::class)->except(['create', 'store', 'edit', 'update', 'destroy']);
    Route::resource('flights', FlightController::class)->except(['index', 'create', 'store', 'destroy']);

});