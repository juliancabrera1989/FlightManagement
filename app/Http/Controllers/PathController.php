<?php

namespace App\Http\Controllers;

use App\Services\PathService;
use Illuminate\Http\Request;

class PathController extends Controller
{
    protected $pathService;

    public function __construct(PathService $pathService)
    {
        $this->pathService = $pathService;
    }

    public function index()
    {
        return view('paths.index');
    }

    public function show(Request $request)
    {


// 1. DIAGNÓSTICO: Ver si realmente Laravel ve vuelos en la base de datos
    // $todosLosVuelos = \App\Models\Flight::all();
    
    // // Mostramos la cantidad de vuelos totales y los datos que llegaron del formulario
    // dd([
    //     'Cantidad total de vuelos en BD' => $todosLosVuelos->count(),
    //     'Primeros 2 vuelos para ver estructura' => $todosLosVuelos->take(2)->toArray(),
    //     'Datos del formulario recibidos' => $request->all()
    // ]);





        $searchType = $request->input('search_type', 'optimal');

        // 🔹 CASO A: El usuario quiere explorar absolutamente TODAS las combinaciones con DFS
        if ($searchType === 'all_alternative') {
            $request->validate([
                'departure_airport_id' => 'required|exists:airports,id',
                'arrival_airport_id' => 'required|exists:airports,id',
            ]);

            $allPaths = $this->pathService->getAllAlternativePaths(
                $request->departure_airport_id, 
                $request->arrival_airport_id
            );
            
            // Retornamos la nueva vista pasándole la colección de caminos del DFS
            return view('paths.all', compact('allPaths'));
        }

        // 🔹 CASO B: Flujo tradicional de Dijkstra (Tu código original intacto)
        $request->validate([
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id' => 'required|exists:airports,id',
            'criteria' => 'required|array|min:1',
            'criteria.*' => 'in:distance,cost,time'
        ]);

        $paths = $this->pathService->getPaths(
            $request->departure_airport_id, 
            $request->arrival_airport_id, 
            $request->criteria
        );

        return view('paths.show', compact('paths'));
    }
}