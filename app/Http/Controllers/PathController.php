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
        $criteria    = $request->input('criteria') ?? ['distance', 'cost', 'time'];
        $startDate   = $request->input('start_date');
        $endDate     = $request->input('end_date');

        if ($searchType === 'all_alternative') {
            $allPaths = $pathService->getAllAlternativePaths($departureId, $arrivalId, $startDate, $endDate);
            return view('paths.all', compact('allPaths'));
        }

        $paths = $pathService->getPaths($departureId, $arrivalId, $criteria, $startDate, $endDate);
        return view('paths.show', compact('paths'));
    }
}