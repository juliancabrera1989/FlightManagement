<?php



namespace App\Http\Controllers;

use App\Models\Airline;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;

class AirlineController extends Controller
{
    public function index()
    {
        $airlines = Airline::all();
        return view('airlines.index', compact('airlines'));
    }

    public function create()
    {
        return view('airlines.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:airlines'
        ]);
        

        Airline::create($request->all());
        return redirect('flights')->with('mensaje', 'Airline created successfully.');
    }

    public function show(Airline $airline)
    {
        return view('airlines.show', compact('airline'));
    }

    public function edit(Airline $airline)
    {
        return view('airlines.edit', compact('airline'));
    }

    public function update(Request $request, Airline $airline)
    {
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:airlines,code,' . $airline->id,
        ]);

        $airline->update($request->all());
        return redirect()->route('airlines.index')->with('success', 'Airline updated successfully.');
    }

    public function destroy(Airline $airline)
    {
        $airline->delete();
        return redirect()->route('airlines.index')->with('success', 'Airline deleted successfully.');
    }


    public function getAirlinesApi()
    {
        // Trae las aerolíneas con id, name y logo_path
        $airlines = Airline::select('id', 'name', 'logo_path')->get();
        
        return response()->json($airlines);
    }

}
