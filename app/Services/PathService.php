<?php

namespace App\Services;

use App\Models\Airport;
use App\Models\Flight;
use Carbon\Carbon;

class PathService
{
    protected $graphService;

    public function __construct(GraphService $graphService)
    {
        $this->graphService = $graphService;
        $this->graphService->buildGraph();
    }

  public function buildPath($departure_airport_id, $arrival_airport_id, $criteria, $startDate = null, $endDate = null)
{
    $result = $this->graphService->dijkstra($departure_airport_id, $arrival_airport_id, $criteria, $startDate, $endDate);

    if ($result === null) {
        return null; 
    }

    $pathIds = $result['nodes'];
    $bestFlightUsed = $result['flights_used'];

    $flights = collect();
    $total_cost = 0;
    $total_distance = 0;

    for ($i = 1; $i < count($pathIds); $i++) {
        $v = $pathIds[$i];
        $flightDetails = $bestFlightUsed[$v];

        $flights->push($flightDetails['flight']);
        $total_cost += $flightDetails['cost'];
        $total_distance += $flightDetails['distance'];
    }

    $first_departure_time = $flights->isNotEmpty() ? $flights->first()->departure_time : null;
    $final_arrival_time = $flights->isNotEmpty() ? $flights->last()->arrival_time : null;
    $transhipments = $flights->count() - 1;

    // PUNTO CLAVE: El tiempo total es desde la Cota Inferior ($startDate) hasta el aterrizaje final
    $baselineDate = $startDate ? Carbon::parse($startDate) : ($first_departure_time ? Carbon::parse($first_departure_time) : null);

    $total_time = ($baselineDate && $final_arrival_time) 
        ? $baselineDate->diffInMinutes(Carbon::parse($final_arrival_time))
        : 0;

    $departureAirports = $flights->pluck('departureAirport')->all();
    $arrivalAirports = $flights->pluck('arrivalAirport')->all();
    $airports = array_values(array_unique(array_merge($departureAirports, $arrivalAirports), SORT_REGULAR));

    return new Path(
        $airports,
        $flights,
        $total_cost,
        $transhipments,
        $final_arrival_time,
        $total_distance,
        $total_time,
        $first_departure_time
    );
}

    public function getPaths($departure_airport_id, $arrival_airport_id, $criteria, $startDate = null, $endDate = null)
    {
        // Tratamiento de "Solo Cota Superior": la cota inferior pasa a ser la fecha/hora actual
        if (!$startDate && $endDate) {
            $startDate = now()->toDateTimeString();
        }

        $paths = [];
        foreach ($criteria as $criterion) {
            $path = $this->buildPath($departure_airport_id, $arrival_airport_id, $criterion, $startDate, $endDate);
            if ($path !== null) {
                $paths[$criterion] = $path;
            }
        }

        return $paths;
    }

    public function getAllAlternativePaths($departure_airport_id, $arrival_airport_id, $startDate = null, $endDate = null)
    {
        if (!$startDate && $endDate) {
            $startDate = now()->toDateTimeString();
        }

        $rawPaths = $this->graphService->findAllPaths($departure_airport_id, $arrival_airport_id, $startDate, $endDate);
        $processedPaths = collect();

        foreach ($rawPaths as $flightRoute) {
            $flights = collect();
            $total_cost = 0;
            $total_distance = 0;
            $airportsIds = [];

            foreach ($flightRoute as $flightDetails) {
                $flight = $flightDetails['flight'];
                $flights->push($flight);
                $total_cost += $flightDetails['cost'];
                $total_distance += $flightDetails['distance'];

                $airportsIds[] = $flight->departure_airport_id;
                $airportsIds[] = $flight->arrival_airport_id;
            }

            $airportsIds = array_values(array_unique($airportsIds));
            
            $airports = Airport::whereIn('id', $airportsIds)
                ->get()
                ->sortBy(function ($airport) use ($airportsIds) {
                    return array_search($airport->id, $airportsIds);
                })
                ->values()
                ->all();

            $first_departure_time = $flights->isNotEmpty() ? $flights->first()->departure_time : null;
            $final_arrival_time = $flights->isNotEmpty() ? $flights->last()->arrival_time : null;
            $transhipments = $flights->count() - 1;
            $total_time = ($first_departure_time && $final_arrival_time) 
                ? Carbon::parse($first_departure_time)->diffInMinutes(Carbon::parse($final_arrival_time))
                : 0;

            $processedPaths->push(new Path(
                $airports,
                $flights,
                $total_cost,
                $transhipments,
                $final_arrival_time,
                $total_distance,
                $total_time,
                $first_departure_time
            ));
        }

        return $processedPaths->sortBy('final_arrival_time')->values();
    }    
}