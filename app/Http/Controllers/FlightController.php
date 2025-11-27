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


        public function index(Request $request)
        {
            $user = auth()->user();

            // EMPLOYEE VIEW
            if ($user->role === 'employee') {
                $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])->get();
                return view('flights.index', compact('flights'));
            }

            // PASSENGER VIEW (BOARD)
            $type = $request->get('type', 'departures'); // default

            if ($type === 'arrivals') {
                $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])
                    ->orderBy('arrival_time')
                    ->get();
            } else {
                // departures
                $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])
                    ->orderBy('departure_time')
                    ->get();
            }

            return view('flights.board', compact('flights', 'type'));

           // Fallback for guests (if you want guests to see nothing or redirect)
            // return redirect()->route('login.form')->with('error', 'Please log in to view flights.');
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
    
        private function authorizeRole($role)
    {
        $user = Auth::user();
        if (!$user || $user->role !== $role) {
            abort(403, 'Unauthorized.');
        }
    }


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

public function filter(Request $request)
{


    //  \Log::info("FILTER:", $request->all());
        \Log::info('FILTER RECEIVED', [
            'airport_id' => $request->airport_id,
            'type'       => $request->type,
        ]);

    $airport_id = $request->airport_id;
    $type = $request->type;

    $query = Flight::query();

    if ($airport_id) {
        $query->where(function($q) use ($airport_id, $type) {
            
            if ($type === 'departure') {
                $q->where('departure_airport_id', $airport_id);
            } 
            else if ($type === 'arrival') {
                $q->where('arrival_airport_id', $airport_id);
            } 
            else {
                // type not set → return both arrivals & departures
                $q->where('departure_airport_id', $airport_id)
                  ->orWhere('arrival_airport_id', $airport_id);
            }
        });
    }

    $flights = $query
        ->with(['airline', 'departureAirport', 'arrivalAirport'])
        ->orderBy('departure_time')
        ->limit(100)
        ->get();

    return response()->json($flights);
}



}
