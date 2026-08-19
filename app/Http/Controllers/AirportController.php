<?php



namespace App\Http\Controllers;

use App\Models\Airport;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AirportController extends Controller
{
    public function index()
    {
        $airports = Airport::all();
        return view('airports.index', compact('airports'));
    }

    public function create()
    {
        return view('airports.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:airports',
            'city' => 'required',
            'country' => 'required',
            'latitude' => 'required',
            'longitude' => 'required',
        ]);

        Airport::create($request->all());
        return redirect('flights')->with('mensaje', 'Airport created successfully.');
    }

    public function show(Airport $airport)
    {
        return view('airports.show', compact('airport'));
    }

    public function edit(Airport $airport)
    {
        return view('airports.edit', compact('airport'));
    }

    public function update(Request $request, Airport $airport)
    {
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:airports,code,' . $airport->id,
            'city' => 'required',
            'country' => 'required',
            'latitude' => 'required',
            'longitude' => 'required'
        ]);

        $airport->update($request->all());
        return redirect()->route('airports.index')->with('success', 'Airport updated successfully.');
    }

    public function destroy(Airport $airport)
    {
        $airport->delete();
        return redirect()->route('airports.index')->with('success', 'Airport deleted successfully.');
    }



// Return distinct countries that have airports
public function countries()
{
    $countries = Airport::select('country')
        ->distinct()
        ->orderBy('country')
        ->get();

    return response()->json($countries);
}

// Return airports for a given country (query param ?country=Argentina)
public function airportsByCountry(Request $request)
{
    $country = $request->query('country');

    if (!$country) {
        return response()->json([], 400);
    }

    $airports = Airport::where('country', $country)
        ->orderBy('name')
        ->get();

    return response()->json($airports);
}




}
