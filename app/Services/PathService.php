<?php

// namespace App\Services;

// use App\Models\Flight;
// use Carbon\Carbon;

// class PathService
// {
//     protected $graphService;

//     public function __construct(GraphService $graphService)
//     {
//         $this->graphService = $graphService;
//         $this->graphService->buildGraph();
//     }

//     public function buildPath($departure_airport_id, $arrival_airport_id, $criteria)
//     {
//         $pathIds = $this->graphService->dijkstra($departure_airport_id, $arrival_airport_id, $criteria);

//         if ($pathIds === null || count($pathIds) <2) {
//             return null; // No path found
//         }

//         $flights = collect();
//         $total_cost = 0;
//         $total_distance = 0;
//         $total_time = 0;

//         $graph = $this->graphService->getGraph();

//         for ($i = 0; $i < count($pathIds) - 1; $i++) {
//             $flightDetails = $graph[$pathIds[$i]][$pathIds[$i + 1]];
//             $flights->push($flightDetails['flight']);
//             $total_cost += $flightDetails['cost'];
//             $total_distance += $flightDetails['distance'];
//             $total_time += $flightDetails['time'];
//         }

//         $transhipments = $flights->count() - 1;
//         $final_arrival_time = $flights->last()->arrival_time;

//         return new Path(
//             $flights->pluck('departureAirport')->merge($flights->pluck('arrivalAirport'))->unique('id'),
//             $flights,
//             $total_cost,
//             $transhipments,
//             $final_arrival_time,
//             $total_distance,
//             $total_time
//         );
//     }

//     public function getPaths($departure_airport_id, $arrival_airport_id, $criteria)
//     {
//         $paths = [];
//         $criteriaList = ['distance', 'cost', 'time'];

//         foreach ($criteriaList as $criterion) {
//             $path = $this->buildPath($departure_airport_id, $arrival_airport_id, $criterion);
//             if ($path) {
//                 $paths[$criterion] = $path;
//             }
//         }

        // Sort paths based on the selected criteria
        // if (isset($paths[$criteria])) {
        //     uasort($paths, function($a, $b) use ($criteria) {
        //         return $a->$criteria <=> $b->$criteria;
        //     });
        // }

        // if (count($paths) > 1 && isset($paths[0]->$criteria)) {
        //     usort($paths, function($a, $b) use ($criteria) {
        //         return $a->$criteria <=> $b->$criteria;
        //     });
        // }

//         return $paths;
//     }
// }

// 





namespace App\Services;

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

    public function buildPath($departure_airport_id, $arrival_airport_id, $criteria)
    {
        $pathIds = $this->graphService->dijkstra($departure_airport_id, $arrival_airport_id, $criteria);

        // if ($pathIds === null || count($pathIds) < 2) {
        //     return null; // No path found or only one airport in the path
        // }
        if ($pathIds === null) {
            return null; // No path found
        }

        if (count($pathIds) === 2) {
            // Direct flight case
            $flight = Flight::where('departure_airport_id', $departure_airport_id)
                            ->where('arrival_airport_id', $arrival_airport_id)
                            ->first();
            if ($flight) {
                $total_cost = $flight->ticket_cost;
                $total_distance = $this->graphService->calculateDistance(
                    $flight->departureAirport->latitude, $flight->departureAirport->longitude,
                    $flight->arrivalAirport->latitude, $flight->arrivalAirport->longitude
                );
                $total_time = $flight->duration;
                $transhipments = 0;
                $final_arrival_time = $flight->arrival_time;

                return new Path(
                    collect([$flight->departureAirport, $flight->arrivalAirport]),
                    collect([$flight]),
                    $total_cost,
                    $transhipments,
                    $final_arrival_time,
                    $total_distance,
                    $total_time
                );
            }
            return null; // No flight found for direct path
        }

        $flights = collect();
        $total_cost = 0;
        $total_distance = 0;
        $total_time = 0;

        $graph = $this->graphService->getGraph();

        for ($i = 0; $i < count($pathIds) - 1; $i++) {
            $flightDetails = $graph[$pathIds[$i]][$pathIds[$i + 1]];
            $flights->push($flightDetails['flight']);
            $total_cost += $flightDetails['cost'];
            $total_distance += $flightDetails['distance'];
            $total_time += $flightDetails['time'];
        }

        $transhipments = $flights->count() - 1;
        $final_arrival_time = $flights->isNotEmpty() ? $flights->last()->arrival_time : null;

        return new Path(
            $flights->pluck('departureAirport')->merge($flights->pluck('arrivalAirport'))->unique('id'),
            $flights,
            $total_cost,
            $transhipments,
            $final_arrival_time,
            $total_distance,
            $total_time
        );
    }

    public function getPaths($departure_airport_id, $arrival_airport_id, $criteria)
    {
        $paths = [];
        foreach ($criteria as $criterion) {
            $paths[$criterion] = $this->buildPath($departure_airport_id, $arrival_airport_id, $criterion);
        }

        if (count($criteria) > 1) {
            uasort($paths, function ($a, $b) use ($criteria) {
                foreach ($criteria as $criterion) {
                    if(property_exists($a, $criterion) && property_exists($b, $criterion)) {
                        $comparison = $a->$criterion <=> $b->$criterion;
                        if ($comparison !== 0) {
                            return $comparison;
                        }
                    }

                }
                return 0;
            });
        }

        return $paths;
    }
}