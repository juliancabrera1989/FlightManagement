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

    // public function index()
    // {
    //     return view('paths.index');
    // }
    // public function index()
    // {
    //     $airports = \App\Models\Airport::all(); // <-- Agrega esto

    //     return view('paths.index', compact('airports')); // <-- Y pásalo a la vista
    // }

    public function index()
{
    \Log::info('1. Entrando al index de paths');

    $airports = \App\Models\Airport::all();
    \Log::info('2. Aeropuertos obtenidos con éxito. Cantidad: ' . $airports->count());

    return view('paths.index', compact('airports'));
}

    public function show(Request $request)
    {
        $request->validate([
            'departure_airport_id' => 'required|exists:airports,id',
            'arrival_airport_id'   => 'required|exists:airports,id',
            'search_type'          => 'required|in:optimal,all_alternative',
            'criteria'             => 'nullable|array',
            'start_date'           => 'nullable|date',
            'end_date'             => 'nullable|date|after_or_equal:start_date',
        ]);

        $departureId = $request->input('departure_airport_id');
        $arrivalId   = $request->input('arrival_airport_id');
        $searchType  = $request->input('search_type');
        $criteria = $request->input('criteria');
        if (empty($criteria)) {
            $criteria = ['distance', 'cost', 'time']; // Valor por defecto para evitar que colapse
        }
        $startDate   = $request->input('start_date');
        $endDate     = $request->input('end_date');

        // 🔹 CASO A: DFS (Explorar todas las alternativas)
        if ($searchType === 'all_alternative') {
            $allPaths = $this->pathService->getAllAlternativePaths($departureId, $arrivalId, $startDate, $endDate);

            // ✅ Retorna la vista exclusiva de DFS con su mapa interactivo
            return view('paths.all', compact('allPaths'));
        }

        // 🔹 CASO B: Dijkstra (Rutas óptimas)
        $paths = $this->pathService->getPaths($departureId, $arrivalId, $criteria, $startDate, $endDate);

        // ✅ Retorna la vista exclusiva de Dijkstra
        return view('paths.show', compact('paths'));
    }
}