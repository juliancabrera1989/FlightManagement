<?php
namespace App\Services;

use App\Models\Flight;
use App\Models\Airport;

class GraphService
{
    protected $graph = [];
    protected $airports;

    public function __construct()
    {
        $this->airports = Airport::all();
    }

    public function buildGraph()
    {
        $this->graph = [];

        $flights = Flight::with(['departureAirport', 'arrivalAirport'])->get();

        foreach ($flights as $flight) {
            if (!$flight->departureAirport || !$flight->arrivalAirport) {
                continue;
            }

            $dist = $this->calculateDistance(
                $flight->departureAirport->latitude,
                $flight->departureAirport->longitude,
                $flight->arrivalAirport->latitude,
                $flight->arrivalAirport->longitude
            );

            $this->graph[$flight->departure_airport_id][$flight->arrival_airport_id][] = [
                'distance' => $dist,
                'cost'     => $flight->ticket_cost,
                'flight'   => $flight
            ];
        }
    }

    public function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371;
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;
        $a = sin($dlat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dlon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function dijkstra($start, $end, $criteria, $startDate = null, $endDate = null)
    {
        $dist = [];
        $prev = [];
        $bestFlightUsed = [];
        $arrivalTimeAtNode = [];
        $queue = [];

        $startTimestamp = $startDate ? strtotime($startDate) : null;
        $endTimestamp = $endDate ? strtotime($endDate) : null;

        foreach ($this->airports as $airport) {
            $dist[$airport->id] = INF;
            $prev[$airport->id] = null;
            $arrivalTimeAtNode[$airport->id] = null;
            $queue[$airport->id] = INF;
        }

        $dist[$start] = 0;
        $queue[$start] = 0;
        $arrivalTimeAtNode[$start] = $startTimestamp;

        while (!empty($queue)) {
            $u = array_search(min($queue), $queue);
            $currentDist = $queue[$u];
            unset($queue[$u]);

            if ($currentDist === INF || $u == $end) {
                break;
            }

            if (!isset($this->graph[$u])) {
                continue;
            }

            foreach ($this->graph[$u] as $v => $listOfFlights) {
                foreach ($listOfFlights as $flightDetails) {
                    $flight = $flightDetails['flight'];
                    $depTime = strtotime($flight->departure_time);
                    $arrTime = strtotime($flight->arrival_time);

                    if ($startTimestamp && $depTime < $startTimestamp) continue;
                    if ($endTimestamp && $arrTime > $endTimestamp) continue;

                    if ($u != $start && $arrivalTimeAtNode[$u] !== null) {
                        $minScale = $arrivalTimeAtNode[$u] + (45 * 60);
                        $maxScale = $arrivalTimeAtNode[$u] + (48 * 3600);
                        if ($depTime < $minScale || $depTime > $maxScale) continue;
                    }

                    $weight = ($criteria === 'time') ? $arrTime : $flightDetails[$criteria];
                    $alt = ($criteria === 'time') ? $weight : ($dist[$u] + $weight);

                    if ($alt < $dist[$v]) {
                        $dist[$v] = $alt;
                        $prev[$v] = $u;
                        $bestFlightUsed[$v] = $flightDetails;
                        $arrivalTimeAtNode[$v] = $arrTime;
                        $queue[$v] = $alt;
                    }
                }
            }
        }

        if ($dist[$end] === INF) return null;

        $path = [];
        $u = $end;
        while ($prev[$u] !== null) {
            array_unshift($path, $u);
            $u = $prev[$u];
        }
        array_unshift($path, $start);

        return [
            'nodes' => $path,
            'flights_used' => $bestFlightUsed
        ];
    }

    // public function findAllPaths($start, $end, $startDate = null, $endDate = null, $maxPaths = 15, $allowRepeats = false)
    // {
    //     $allPaths = [];
    //     $visited = [];
    //     $startTimestamp = $startDate ? strtotime($startDate) : null;
    //     $endTimestamp = $endDate ? strtotime($endDate) : null;

    //     $this->dfs($start, $end, $visited, [], $allPaths, null, 0, $startTimestamp, $endTimestamp, $maxPaths, $allowRepeats);

    //     return $allPaths;
    // }
    
//  public function findAllPaths($start, $end, $startDate = null, $endDate = null, $maxPaths = 15, $allowRepeats = false)
//     {
//     $allPaths = [];
//     $visited = [];
//     $startTimestamp = $startDate ? strtotime($startDate) : null;
//     $endTimestamp = $endDate ? strtotime($endDate) : null;

//     $this->dfs($start, $end, $visited, [], $allPaths, null, 0, $startTimestamp, $endTimestamp, $maxPaths, $allowRepeats);

//     // Si NO se permiten repeticiones, filtramos para que cada camino tenga una secuencia única de aeropuertos
//     if (!$allowRepeats) {
//         $uniquePaths = [];
//         $seenSequences = [];

//         foreach ($allPaths as $path) {
//             // Generamos una firma única basada en la secuencia de IDs de aeropuertos
//             $sequenceKey = implode('->', array_map(function($item) {
//                 return $item['flight']->departure_airport_id . '-' . $item['flight']->arrival_airport_id;
//             }, $path));

//             if (!in_array($sequenceKey, $seenSequences)) {
//                 $seenSequences[] = $sequenceKey;
//                 $uniquePaths[] = $path;
//             }
//         }

//         return array_slice($uniquePaths, 0, $maxPaths);
//     }

//     return array_slice($allPaths, 0, $maxPaths);
// }

public function findAllPaths($start, $end, $startDate = null, $endDate = null, $maxPaths = 15, $allowRepeats = false)
{
    $allPaths = [];
    $visited = [];
    $startTimestamp = $startDate ? strtotime($startDate) : null;
    $endTimestamp = $endDate ? strtotime($endDate) : null;

    // Si no permite repetidos, le pedimos mas caminos al DFS para tener margen tras el filtrado
    $searchLimit = $allowRepeats ? $maxPaths : ($maxPaths * 4);

    $this->dfs($start, $end, $visited, [], $allPaths, null, 0, $startTimestamp, $endTimestamp, $searchLimit, $allowRepeats);

    if (!$allowRepeats) {
        $uniquePaths = [];
        $seenSequences = [];

        foreach ($allPaths as $path) {
            // Firma de secuencia de aeropuertos (ej: "ORD-SIN->SIN-SYD->SYD-FRA")
            $sequenceKey = implode('->', array_map(function($item) {
                return $item['flight']->departure_airport_id . '-' . $item['flight']->arrival_airport_id;
            }, $path));

            if (!in_array($sequenceKey, $seenSequences)) {
                $seenSequences[] = $sequenceKey;
                $uniquePaths[] = $path;
            }
        }

        return array_slice($uniquePaths, 0, $maxPaths);
    }

    return array_slice($allPaths, 0, $maxPaths);
}

    protected function dfs($currentAirport, $destination, &$visited, $currentPathFlights, &$allPaths, $lastArrivalTime, $depth, $startTimestamp, $endTimestamp, $maxPaths, $allowRepeats)
    {
        if (count($allPaths) >= $maxPaths || $depth > 3) return;

        if ($currentAirport == $destination) {
            $allPaths[] = $currentPathFlights;
            return;
        }

        $visited[$currentAirport] = true;

        if (isset($this->graph[$currentAirport])) {
            foreach ($this->graph[$currentAirport] as $nextAirport => $listOfFlights) {
                // Si no se permiten repetidos, omitir nodos ya visitados en esta rama
                if (!$allowRepeats && isset($visited[$nextAirport]) && $visited[$nextAirport]) {
                    continue;
                }

                foreach ($listOfFlights as $flightDetails) {
                    if (count($allPaths) >= $maxPaths) break;

                    $depTime = strtotime($flightDetails['flight']->departure_time);
                    $arrTime = strtotime($flightDetails['flight']->arrival_time);

                    if ($startTimestamp && $depTime < $startTimestamp) continue;
                    if ($endTimestamp && $arrTime > $endTimestamp) continue;

                    if ($lastArrivalTime !== null && $depTime < $lastArrivalTime) continue;

                    $currentPathFlights[] = $flightDetails;

                    $this->dfs(
                        $nextAirport, $destination, $visited, $currentPathFlights, 
                        $allPaths, $arrTime, $depth + 1, $startTimestamp, $endTimestamp, $maxPaths, $allowRepeats
                    );

                    array_pop($currentPathFlights);
                }
            }
        }

        $visited[$currentAirport] = false;
    }

    public function getGraph() {
        return $this->graph;
    }
}