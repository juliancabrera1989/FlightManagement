<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use App\Models\Airline;
use App\Models\Airport;
use Illuminate\Http\Request;

use Carbon\Carbon;

use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Storage;

class FlightController extends Controller
{
  

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



      public function create()
    {
        $this->authorizeRole('employee');
        $airlines = Airline::all();
        $airports = Airport::all();
        return view('flights.create', compact('airlines', 'airports'));
    }
    // public function store(Request $request)
    // {

    //      $this->authorizeRole('employee');

         
    //     $request->validate([
    //         'airline_id' => 'required|exists:airlines,id',
    //         'departure_airport_id' => 'required|exists:airports,id',
    //         'arrival_airport_id' => 'required|exists:airports,id',
    //         'flight_number' => 'required|unique:flights',
    //         'departure_time' => 'required|date',
    //         'arrival_time' => 'required|date',
    //         'ticket_cost' => 'required',
    //         'duration' => 'required'
    //     ]);
        
    //     Flight::create($request->all());
    //     return redirect('flights')->with('mensaje', 'Flight created successfully.');
    // }

    // public function store(Request $request)
    // {
    //     $user = auth()->user();

    //     // 1. Si es empleado de aerolínea, forzamos que use su propia airline_id
    //     if ($user->role === 'airline_employee') {
    //         $request->merge(['airline_id' => $user->airline_id]);
    //     }

    //     // 2. Validaciones normales
    //     $request->validate([
    //         'airline_id'           => 'required|exists:airlines,id',
    //         'departure_airport_id' => 'required|exists:airports,id',
    //         'arrival_airport_id'   => 'required|exists:airports,id',
    //         'flight_number'        => 'required|unique:flights,flight_number',
    //         'departure_time'       => 'required|date',
    //         'arrival_time'         => 'required|date|after:departure_time',
    //         'ticket_cost'          => 'required|numeric',
    //         'status'               => 'required|string',
    //     ]);

    //     // 3. Extracción de datos y cálculo de duración
    //     $data = $request->all();
    //     $start = \Carbon\Carbon::parse($request->departure_time);
    //     $end   = \Carbon\Carbon::parse($request->arrival_time);
    //     $data['duration'] = $start->diffInMinutes($end);

    //     Flight::create($data);

    //     return redirect()->route('flights.index')->with('mensaje', 'Flight created successfully.');
    // }
    public function store(Request $request)
    {
        $user = auth()->user();

        // 1. Si es empleado de aerolínea, forzamos su propia airline_id
        if ($user->role === 'airline_employee' || $user->airline_id) {
            $request->merge(['airline_id' => $user->airline_id]);
        }

        // 2. Si es empleado de aeropuerto, forzamos que su aeropuerto sea Origen o Destino según la operación
        if ($user->isEmployee() && $user->employee_type === 'airport') {
            if ($request->input('operation_type') === 'arrival') {
                $request->merge(['arrival_airport_id' => $user->airport_id]);
            } else {
                // Por defecto la operación asumida es 'departure'
                $request->merge(['departure_airport_id' => $user->airport_id]);
            }
        }

        // 3. Validaciones
        $validated = $request->validate([
            'airline_id'           => 'required|exists:airlines,id',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id'   => 'required|exists:airports,id|different:departure_airport_id',
            'flight_number'        => 'required|unique:flights,flight_number',
            'departure_time'       => 'required|date',
            'arrival_time'         => 'required|date|after:departure_time',
            'ticket_cost'          => 'required|numeric|min:0',
            'status'               => 'required|string',
        ]);

        // 4. Cálculo de la duración en minutos
        $start = \Carbon\Carbon::parse($request->departure_time);
        $end   = \Carbon\Carbon::parse($request->arrival_time);
        $validated['duration'] = $start->diffInMinutes($end);

        // 5. Creación segura usando solo los campos validados
        Flight::create($validated);

        return redirect()->route('flights.index')->with('mensaje', 'Flight created successfully.');
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

    // public function update(Request $request, Flight $flight)
    // {

    //     $this->authorizeRole('employee');
    //     $request->validate([
    //         'airline_id' => 'required|exists:airlines,id',
    //         'departure_airport_id' => 'required|exists:airports,id',
    //         'arrival_airport_id' => 'required|exists:airports,id',
    //         'flight_number' => 'required|unique:flights,flight_number,' . $flight->id,
    //         'departure_time' => 'required|date',
    //         'arrival_time' => 'required|date',
    //         'ticket_cost' => 'required',
    //         'duration' => 'required'
    //     ]);

    //     $flight->update($request->all());
    //     return redirect('flights')->with('mensaje', 'Flight updated successfully.');
    // }



//     public function update(Request $request, Flight $flight)
// {
//     $user = auth()->user();

//     if ($user->role === 'airport_employee') {
//         if ($flight->departure_airport_id !== $user->airport_id && $flight->arrival_airport_id !== $user->airport_id) {
//             abort(403, 'No tienes permiso para modificar vuelos fuera de tu aeropuerto.');
//         }
//     } elseif ($user->role === 'airline_employee') {
//         if ($flight->airline_id !== $user->airline_id) {
//             abort(403, 'No tienes permiso para modificar vuelos de otra aerolínea.');
//         }
//     }

//     // Lógica para guardar la actualización...
//     // 2. Validación de datos recibidos
//     $request->validate([
//         'airline_id'           => 'required|exists:airlines,id',
//         'departure_airport_id' => 'required|exists:airports,id',
//         'arrival_airport_id'   => 'required|exists:airports,id',
//         'flight_number'        => 'required|unique:flights,flight_number,' . $flight->id,
//         'departure_time'       => 'required|date',
//         'arrival_time'         => 'required|date',
//         'ticket_cost'          => 'required|numeric',
//         'duration'             => 'nullable'
//     ]);

//     // 3. Actualización y redirección
//     $flight->update($request->all());

//     return redirect()->route('flights.index')->with('mensaje', 'Flight updated successfully.');
// }


    public function update(Request $request, Flight $flight)
    {
        $user = auth()->user();

        // Validación de permisos según rol...
        if ($user->role === 'airport_employee' && $flight->departure_airport_id !== $user->airport_id && $flight->arrival_airport_id !== $user->airport_id) {
            abort(403);
        } elseif ($user->role === 'airline_employee' && $flight->airline_id !== $user->airline_id) {
            abort(403);
        }

        $request->validate([
            'airline_id'           => 'required|exists:airlines,id',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id'   => 'required|exists:airports,id',
            'flight_number'        => 'required|unique:flights,flight_number,' . $flight->id,
            'departure_time'       => 'required|date',
            'arrival_time'         => 'required|date|after:departure_time',
            'ticket_cost'          => 'required|numeric',
            'status'               => 'required|string',
        ]);

        $data = $request->all();

        // Recalculamos la duración
        $start = Carbon::parse($request->departure_time);
        $end   = Carbon::parse($request->arrival_time);
        $data['duration'] = $start->diffInMinutes($end);

        $flight->update($data);

        return redirect()->route('flights.index')->with('mensaje', 'Flight updated successfully.');
    }

    public function destroy(Flight $flight)
    {
        $this->authorizeRole('employee');
        $flight->delete();
        return redirect('flights')->with('success', 'Flight deleted successfully.');
    }
    

   
 

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


