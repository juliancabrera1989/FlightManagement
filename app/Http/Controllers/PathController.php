<?php

namespace App\Http\Controllers;

use App\Services\PathService;
use App\Models\Airport;
use Illuminate\Http\Request;

class PathController extends Controller
{
    // Carga ultraligera solo para renderizar el formulario
    public function index()
    {
        $airports = Airport::select('id', 'name', 'code', 'city', 'country')
            ->orderBy('name', 'asc')
            ->get();

        return view('paths.index', compact('airports'));
    }

    // Inyectamos el servicio SOLO cuando se presiona "Find Path"
  public function show(Request $request, PathService $pathService)
{
    \Log::info('--- INICIANDO BÚSQUEDA DE PATHS ---');
    \Log::info('Parámetros recibidos:', $request->all());

    $request->validate([
        'departure_airport_id' => 'required|exists:airports,id',
        'arrival_airport_id'   => 'required|exists:airports,id',
        'search_type'          => 'required|in:optimal,all_alternative',
    ]);

    $departureId = $request->input('departure_airport_id');
    $arrivalId   = $request->input('arrival_airport_id');
    $searchType  = $request->input('search_type');
    $criteria    = $request->input('criteria') ?? ['distance', 'cost', 'time'];
    $startDate   = $request->input('start_date');
    $endDate     = $request->input('end_date');

    try {
        if ($searchType === 'all_alternative') {
            \Log::info('Ejecutando algoritmo DFS...');
            $allPaths = $pathService->getAllAlternativePaths($departureId, $arrivalId, $startDate, $endDate);
            \Log::info('DFS finalizado. Cantidad de rutas encontradas: ' . count($allPaths));

            return view('paths.all', compact('allPaths'));
        }

        \Log::info('Ejecutando algoritmo Dijkstra...');
        $paths = $pathService->getPaths($departureId, $arrivalId, $criteria, $startDate, $endDate);
        \Log::info('Dijkstra finalizado. Resultado procesado.');

        return view('paths.show', compact('paths'));

    } catch (\Exception $e) {
        \Log::error('❌ ERROR EN EL CÁLCULO DE RUTAS: ' . $e->getMessage());
        \Log::error($e->getTraceAsString());

        return back()->with('error', 'Ocurrió un error al calcular la ruta: ' . $e->getMessage());
    }
}
}