<?php



namespace App\Http\Controllers;

use App\Models\Flight;
use App\Models\Airline;
use App\Models\Airport;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;

class FlightController extends Controller
{
    public function index()
    {
        $flights = Flight::with(['airline', 'departureAirport', 'arrivalAirport'])->get();
        return view('flights.index', compact('flights'));
    }

    public function create()
    {
        $airlines = Airline::all();
        $airports = Airport::all();
        return view('flights.create', compact('airlines', 'airports'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'airline_id' => 'required|exists:airlines,id',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id' => 'required|exists:airports,id',
            'flight_number' => 'required|unique:flights',
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date',
            'ticket_cost' => 'required'
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
        $airlines = Airline::all();
        $airports = Airport::all();
        return view('flights.edit', compact('flight', 'airlines', 'airports'));
    }

    public function update(Request $request, Flight $flight)
    {
        $request->validate([
            'airline_id' => 'required|exists:airlines,id',
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id' => 'required|exists:airports,id',
            'flight_number' => 'required|unique:flights,flight_number,' . $flight->id,
            'departure_time' => 'required|date',
            'arrival_time' => 'required|date',
            'ticket_cost' => 'required'
        ]);

        $flight->update($request->all());
        return redirect('flights')->with('mensaje', 'Flight updated successfully.');
    }

    public function destroy(Flight $flight)
    {
        $flight->delete();
        return redirect('flights')->with('success', 'Flight deleted successfully.');
    }
}
