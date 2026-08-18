<?php



namespace App\Http\Controllers;

use App\Models\Flight;
use App\Models\Airline;
use App\Models\Airport;
use Illuminate\Http\Request;


use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Storage;

class FlightController extends Controller
{
    // public function index()
    // {
    //     $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])->get();
    //     return view('flights.index', compact('flights'));
    // }


        // public function index(Request $request)
        // {
        //     $user = auth()->user();

        //     // EMPLOYEE VIEW
        //     if ($user->role === 'employee') {
        //         $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])->get();
        //         return view('flights.index', compact('flights'));
        //     }

        //     // PASSENGER VIEW (BOARD)
        //     $type = $request->get('type', 'departures'); // default

        //     if ($type === 'arrivals') {
        //         $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])
        //             ->orderBy('arrival_time')
        //             ->get();
        //     } else {
        //         // departures
        //         $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])
        //             ->orderBy('departure_time')
        //             ->get();
        //     }

        //     return view('flights.board', compact('flights', 'type'));

        //    // Fallback for guests (if you want guests to see nothing or redirect)
        //     // return redirect()->route('login.form')->with('error', 'Please log in to view flights.');
        // }



    //     public function index(Request $request)
    // {
    //     // 1. Traemos los datos maestros para alimentar los <select> de los filtros
    //     $airports = Airport::orderBy('code')->get();
    //     $airlines = Airline::orderBy('name')->get();

    //     // 2. Iniciamos la consulta base de vuelos cargando las relaciones (Eager Loading)
    //     // para que no sufra la base de datos
    //     $query = Flight::with(['airline', 'departureAirport', 'arrivalAirport']);

    //     // 3. Regla de negocio Temporal (Pasajero vs Empleado)
    //     if (auth()->check() && auth()->user()->role === 'employee') {
    //         // El empleado ve TODO el historial operativo (pasado, presente y futuro)
    //         // Podés limitar por su aerolínea si quisieras: 
    //         // $query->where('airline_id', auth()->user()->airline_id);
    //     } else {
    //         // Regla comercial para Pasajeros: solo vuelos futuros en estado programado
    //         // Oculta los vuelos que salen hoy para evitar compras fuera de término
    //         $query->where('status', 'Scheduled')
    //               ->where('departure_time', '>=', now()->addHours(24));
    //               // 🚫 Comentamos esto temporalmente hasta que agregues la columna a la BD:
    //               // ->where('available_seats', '>', 0);
    //     }

    //     // 4. Aplicación de FILTROS DINÁMICOS (si el usuario los eligió en el formulario)
        
    //     // Filtro por Aeropuerto de Origen
    //     if ($request->filled('origin')) {
    //         $query->where('departure_airport_id', $request->origin);
    //     }

    //     // Filtro por Aeropuerto de Destino
    //     if ($request->filled('destination')) {
    //         $query->where('arrival_airport_id', $request->destination);
    //     }

    //     // Filtro por Fecha de salida exacta
    //     if ($request->filled('date')) {
    //         $query->whereDate('departure_time', $request->date);
    //     }

    //     // Filtro por Aerolínea (Solo se aplica si el request la trae y no está bloqueada)
    //     if ($request->filled('airline') && (!auth()->check() || auth()->user()->role !== 'employee')) {
    //         $query->where('airline_id', $request->airline);
    //     }

    //     // 5. Ejecutamos la consulta ordenando por lo más próximo a salir
    //     $flights = $query->orderBy('departure_time', 'asc')->get();

    //     // 6. Enviamos TODO a la vista index
    //     return view('flights.index', compact('flights', 'airports', 'airlines'));
    // }









    

// public function index(Request $request)
// {
//     $airports = Airport::orderBy('code')->get();
//     $airlines = Airline::orderBy('name')->get();

//     // 1. Iniciamos la consulta base
//     $query = Flight::with(['airline', 'departureAirport', 'arrivalAirport']);

//     // 🔍 PRUEBA DE DIAGNÓSTICO (Opcional):
//     // Si querés ver qué datos tiene Gastón en tiempo real, desconectá la línea de abajo:
//     // dd(auth()->user()->role, auth()->user()->employee_type, auth()->user()->airline_id);

//     // 2. APLICAR CANDADO DE EMPLEADOS
//     if (auth()->check() && auth()->user()->role === 'employee') {
        
//         if (auth()->user()->employee_type === 'airline') {
//             // Si es de aerolínea con ID=9, forzamos que busque solo 'airline_id' = 9
//             $query->where('airline_id', auth()->user()->airline_id);
//         } 
//         elseif (auth()->user()->employee_type === 'airport') {
//             $query->where(function($q) {
//                 $q->where('departure_airport_id', auth()->user()->airport_id)
//                   ->orWhere('arrival_airport_id', auth()->user()->airport_id);
//             });
//         }
        
//     } else {
//         // Filtro comercial para pasajeros comunes
//         $query->where('status', 'Scheduled');
//     }

//     // 3. Filtros manuales del buscador del formulario
//     if ($request->filled('origin')) {
//         $query->where('departure_airport_id', $request->origin);
//     }
//     if ($request->filled('destination')) {
//         $query->where('arrival_airport_id', $request->destination);
//     }
    
//     // OJO ACÁ: Si es empleado de aerolínea, el request('airline') no debería pisar su restricción
//     if ($request->filled('airline') && auth()->user()->employee_type !== 'airline') {
//         $query->where('airline_id', $request->airline);
//     }

//     if ($request->filled('date')) {
//         $query->whereDate('departure_time', $request->date);
//     }

//     // 4. Ejecutamos la consulta final filtrada
//     $flights = $query->orderBy('departure_time', 'asc')->get();

//     return view('flights.index', compact('flights', 'airports', 'airlines'));
// }










public function index(Request $request)
{
    $airports = Airport::orderBy('code')->get();
    $airlines = Airline::orderBy('name')->get();

    // Si no hay parámetros en la URL, mandamos las colecciones vacías para congelar la pantalla inicial
    if (empty($request->all())) {
        return view('flights.index', [
            'flights' => collect(),
            'airports' => $airports,
            'airlines' => $airlines
        ]);
    }

    $query = Flight::with(['airline', 'departureAirport', 'arrivalAirport']);

    // 🔒 REGLAS DE RESTRICCIÓN Y FILTRADO POR ROL
    if (auth()->check() && auth()->user()->role === 'employee') {
        
        if (auth()->user()->employee_type === 'airline') {
            // ✈️ STAFF DE AEROLÍNEA: Forzado a ver solo su empresa
            $query->where('airline_id', auth()->user()->airline_id);

            // Filtros de su formulario específico
            if ($request->filled('origin')) {
                $query->where('departure_airport_id', $request->origin);
            }
            if ($request->filled('destination')) {
                $query->where('arrival_airport_id', $request->destination);
            }
        } 
        elseif (auth()->user()->employee_type === 'airport') {
            // 🏢 STAFF DE AEROPUERTO: Forzado a ver lo que toque su base
            $myAirportId = auth()->user()->airport_id;

            if ($request->input('airport_op') === 'arrivals') {
                // Si busca arribos, el destino del vuelo es SU aeropuerto
                $query->where('arrival_airport_id', $myAirportId);
                
                // Y el filtro "connected_airport" actúa como el origen del vuelo
                if ($request->filled('connected_airport')) {
                    $query->where('departure_airport_id', $request->connected_airport);
                }
            } else {
                // Por defecto: Departures (Salidas). El origen del vuelo es SU aeropuerto
                $query->where('departure_airport_id', $myAirportId);

                // Y el filtro "connected_airport" actúa como el destino final del vuelo
                if ($request->filled('connected_airport')) {
                    $query->where('arrival_airport_id', $request->connected_airport);
                }
            }
        }
        
    } else {
        // 👤 PASAJERO COMÚN: Solo ve programados + filtros comerciales clásicos
        $query->where('status', 'Scheduled');

        if ($request->filled('origin')) {
            $query->where('departure_airport_id', $request->origin);
        }
        if ($request->filled('destination')) {
            $query->where('arrival_airport_id', $request->destination);
        }
        if ($request->filled('airline')) {
            $query->where('airline_id', $request->airline);
        }
    }

    // Filtro global de fecha (Aplica a todos los roles)
    if ($request->filled('date')) {
        $query->whereDate('departure_time', $request->date);
    }

    $flights = $query->orderBy('departure_time', 'asc')->get();

    return view('flights.index', compact('flights', 'airports', 'airlines'));
}









    //     public function index()
    // {
    //     $user = Auth::user();


    //     $flights = Flight::with(['departureAirport', 'arrivalAirport'])->get();

    //      if ($user && $user->role === 'employee') {
    //         // Employee CRUD view (table)
    //         return view('flights.index', compact('flights'));
    //     }

    //     if ($user && $user->role === 'passenger') {
    //         // Passenger board view (airport-style board)
    //         return view('flights.board', compact('flights'));
    //     }
           // Fallback for guests (if you want guests to see nothing or redirect)
                // return redirect()->route('login.form')->with('error', 'Please log in to view flights.');
  
    // }

    // public function create()
    // {
    //     $airlines = Airline::all();
    //     $airports = Airport::all();
    //     return view('flights.create', compact('airlines', 'airports'));
    // }


      public function create()
    {
        $this->authorizeRole('employee');
        $airlines = Airline::all();
        $airports = Airport::all();
        return view('flights.create', compact('airlines', 'airports'));
    }
    public function store(Request $request)
    {

         $this->authorizeRole('employee');

         
        $request->validate([
            'airline_id' => 'required|exists:airlines,id',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id' => 'required|exists:airports,id',
            'flight_number' => 'required|unique:flights',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date',
            'ticket_cost' => 'required',
            'duration' => 'required'
        ]);
        
        Flight::create($request->all());
        return redirect('flights')->with('mensaje', 'Flight created successfully.');
    }

    public function show(Flight $flight)
    {
        return view('flights.show', compact('flight'));
    }

    public function edit(Flight $flight)
    {

        $this->authorizeRole('employee');
        $airlines = Airline::all();
        $airports = Airport::all();
        return view('flights.edit', compact('flight', 'airlines', 'airports'));
    }

    public function update(Request $request, Flight $flight)
    {

        $this->authorizeRole('employee');
        $request->validate([
            'airline_id' => 'required|exists:airlines,id',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id' => 'required|exists:airports,id',
            'flight_number' => 'required|unique:flights,flight_number,' . $flight->id,
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date',
            'ticket_cost' => 'required',
            'duration' => 'required'
        ]);

        $flight->update($request->all());
        return redirect('flights')->with('mensaje', 'Flight updated successfully.');
    }

    public function destroy(Flight $flight)
    {
        $this->authorizeRole('employee');
        $flight->delete();
        return redirect('flights')->with('success', 'Flight deleted successfully.');
    }
    




    
    //     private function authorizeRole($role)
    // {
    //     $user = Auth::user();
    //     if (!$user || $user->role !== $role) {
    //         abort(403, 'Unauthorized.');
    //     }
    // }


//     // API: GET /api/flights?airport_id=3&type=departure&limit=10
// public function filter(Request $request)
// {
//     // DEBUG LIKE TO TEST THAT DB IS WORKING
//     // return response()->json(Flight::limit(10)->get());

//     $airport = $request->query('airport_id');
//     $type = $request->query('type'); // 'arrival' or 'departure'
//     $limit = (int) $request->query('limit', 10);

//     if (!$airport || !$type) {
//         return response()->json([], 400);
//     }

//     $query = Flight::with(['airline', 'departureAirport', 'arrivalAirport']);

//     if ($type === 'arrival') {
//         $query->where('arrival_airport_id', $airport)
//               ->orderBy('arrival_time', 'asc');
//     } else {
//         $query->where('departure_airport_id', $airport)
//               ->orderBy('departure_time', 'asc');
//     }

//     $flights = $query->limit($limit)->get()->map(function($f) {
//         return [
//             'id' => $f->id,
//             'flight_number' => $f->flight_number,
//             'airline' => $f->airline ? $f->airline->name : null,
//             'departure_airport' => $f->departureAirport ? $f->departureAirport->code : null,
//             'arrival_airport' => $f->arrivalAirport ? $f->arrivalAirport->code : null,
//             'departure_time' => optional($f->departure_time)->toDateTimeString(),
//             'arrival_time' => optional($f->arrival_time)->toDateTimeString(),
//             'ticket_cost' => $f->ticket_cost,
//         ];
//     });

//     return response()->json($flights);
// }

// public function filter(Request $request)
// {


//     //  \Log::info("FILTER:", $request->all());
//         \Log::info('FILTER RECEIVED', [
//             'airport_id' => $request->airport_id,
//             'type'       => $request->type,
//         ]);

//     $airport_id = $request->airport_id;
//     $type = $request->type;

//     $query = Flight::query();

//     if ($airport_id) {
//         $query->where(function($q) use ($airport_id, $type) {
            
//             if ($type === 'departure') {
//                 $q->where('departure_airport_id', $airport_id);
//             } 
//             else if ($type === 'arrival') {
//                 $q->where('arrival_airport_id', $airport_id);
//             } 
//             else {
//                 // type not set → return both arrivals & departures
//                 $q->where('departure_airport_id', $airport_id)
//                   ->orWhere('arrival_airport_id', $airport_id);
//             }
//         });
//     }

//     // $flights = $query
//     //     ->with(['airline', 'departureAirport', 'arrivalAirport'])
//     //     ->orderBy('departure_time')
//     //     ->limit(100)
//     //     ->get();

//     $limit = (int) ($request->query('limit', 200));
//     $flights = $query
//     ->with(['airline', 'departureAirport', 'arrivalAirport'])
//     ->orderBy($type === 'arrival' ? 'arrival_time' : 'departure_time', 'asc')
//     ->limit($limit)
//     ->get();

//     return response()->json($flights);
// }


// public function filter(Request $request)
//     {
//         \Log::info('FILTER RECEIVED', [
//             'airport_id' => $request->query('airport'), // Cambiado a query para leer de la URL de la API
//             'type'       => $request->query('direction'), // Tu front manda 'direction' (departures/arrivals)
//         ]);

//         // Mapeamos los nombres de variables que manda tu React actual
//         $airport_id = $request->query('airport');
//         $direction = $request->query('direction', 'departures'); 
        
//         // Convertimos 'departures' -> 'departure' y 'arrivals' -> 'arrival' para tu lógica interna
//         $type = ($direction === 'arrivals') ? 'arrival' : 'departure';

//         $query = Flight::query();

//         if ($airport_id) {
//             $query->where(function($q) use ($airport_id, $type) {
//                 if ($type === 'departures') {
//                     $q->where('departure_airport_id', $airport_id);
//                 } 
//                 else if ($type === 'arrivals') {
//                     $q->where('arrival_airport_id', $airport_id);
//                 } 
//             });
//         }

//         // Cargamos relaciones y ordenamos de forma inteligente según si es salida o llegada
//         $limit = (int) ($request->query('limit', 200));
//         $flights = $query
//             ->with(['airline', 'departureAirport', 'arrivalAirport'])
//             ->orderBy($type === 'arrivals' ? 'arrival_time' : 'departure_time', 'asc')
//             ->limit($limit)
//             ->get();

//         return response()->json($flights);
//     }



public function filter(Request $request)
{
    // 🎯 LEER ATRIBUTOS: Nos aseguramos de capturar exactamente lo que React manda
    $airport_id = $request->query('airport_id') ?? $request->query('airport');
    $type = $request->query('type') ?? $request->query('direction'); // "departures" o "arrivals"

    $query = Flight::query();

    if ($airport_id) {
        $query->where(function($q) use ($airport_id, $type) {
            // Evaluamos tanto en singular como en plural por seguridad
            if ($type === 'departure' || $type === 'departures') {
                $q->where('departure_airport_id', $airport_id);
            } 
            else if ($type === 'arrival' || $type === 'arrivals') {
                $q->where('arrival_airport_id', $airport_id);
            } 
            else {
                // Si no hay tipo, busca en ambos
                $q->where('departure_airport_id', $airport_id)
                  ->orWhere('arrival_airport_id', $airport_id);
            }
        });
    }

    // Ordenamos de forma inteligente según el tipo de tablero
    $isArrival = ($type === 'arrival' || $type === 'arrivals');
    
    $limit = (int) ($request->query('limit', 200));
    $flights = $query
        ->with(['airline', 'departureAirport', 'arrivalAirport'])
        ->orderBy($isArrival ? 'arrival_time' : 'departure_time', 'asc')
        ->limit($limit)
        ->get();

    return response()->json($flights);
}









    private function authorizeRole($role)
    {
        $user = Auth::user();
        if (!$user || $user->role !== $role) {
            abort(403, 'Unauthorized.');
        }
    }
} // Fin del controlador


