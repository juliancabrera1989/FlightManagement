<?php
namespace App\Services;

use App\Models\Flight;
use App\Models\Airport;

class GraphService
{
    protected $graph;
    protected $airports;

    public function __construct()
    {
        $this->graph = [];
        $this->airports = Airport::all();
    }

    public function buildGraph()
    {
        $flights = Flight::all();

        foreach ($flights as $flight) {
            // 🔹 Agregamos [] al final para almacenar una lista de vuelos por tramo
            $this->graph[$flight->departure_airport_id][$flight->arrival_airport_id][] = [
                'distance' => $this->calculateDistance(
                    $flight->departureAirport->latitude,
                    $flight->departureAirport->longitude,
                    $flight->arrivalAirport->latitude,
                    $flight->arrivalAirport->longitude
                ),
                'cost' => $flight->ticket_cost,
                'time' => strtotime($flight->arrival_time) - strtotime($flight->departure_time),
                'flight' => $flight
            ];
        }
    }

    public function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000;

        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;
        $a = sin($dlat / 2) * sin($dlat / 2) + cos($lat1) * cos($lat2) * sin($dlon / 2) * sin($dlon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function dijkstra($start, $end, $criteria)
    {
        $dist = [];
        $prev = [];
        $queue = [];

        foreach ($this->airports as $airport) {
            $dist[$airport->id] = INF;
            $prev[$airport->id] = null;
            $queue[$airport->id] = INF;
        }

        $dist[$start] = 0;
        $queue[$start] = 0;

        while (!empty($queue)) {
            $u = array_search(min($queue), $queue);
            unset($queue[$u]);

            if ($u == $end) {
                break;
            }

            if (!isset($this->graph[$u])) {
                continue;
            }

            foreach ($this->graph[$u] as $v => $listOfFlights) {
                // 🔹 Como ahora hay múltiples vuelos entre $u y $v, buscamos el mejor según el criterio
                $bestFlightWeight = INF;
                foreach ($listOfFlights as $flightDetails) {
                    if ($flightDetails[$criteria] < $bestFlightWeight) {
                        $bestFlightWeight = $flightDetails[$criteria];
                    }
                }

                $alt = $dist[$u] + $bestFlightWeight;

                if ($alt < $dist[$v]) {
                    $dist[$v] = $alt;
                    $prev[$v] = $u;
                    $queue[$v] = $alt;
                }
            }
        }

        $path = [];
        $u = $end;

        while ($prev[$u] !== null) {
            array_unshift($path, $u);
            $u = $prev[$u];
        }

        if ($dist[$end] === INF) {
            return null; 
        }

        array_unshift($path, $start);

        return $path;
    }



/**
     * Punto de entrada para buscar TODOS los caminos posibles entre dos aeropuertos.
     */
    public function findAllPaths($start, $end)
    {
        $allPaths = [];
        $visited = [];
        
        // 🔹 Inicializamos el recorrido con profundidad 0
        $this->dfs($start, $end, $visited, [], $allPaths, null, 0);
        
        return $allPaths;
    }

    /**
     * Algoritmo DFS recursivo con Backtracking, control de escala temporal y límite de profundidad.
     */
    protected function dfs($currentAirport, $destination, &$visited, $currentPathFlights, &$allPaths, $lastArrivalTime, $depth)
    {
        // 🔹 PODA DE CONTROL: Si ya lleva más de 3 vuelos conectados, cortamos la rama.
        // Esto evita que el algoritmo explote analizando rutas infinitas de paseo.
        if ($depth > 3) {
            return;
        }

        if (isset($visited[$currentAirport]) && $visited[$currentAirport]) {
            return;
        }

        if ($currentAirport == $destination) {
            $allPaths[] = $currentPathFlights;
            return;
        }

        $visited[$currentAirport] = true;

        if (isset($this->graph[$currentAirport])) {
            foreach ($this->graph[$currentAirport] as $nextAirport => $listOfFlights) {
                foreach ($listOfFlights as $flightDetails) {
                    
                    $departureTime = strtotime($flightDetails['flight']->departure_time);
                    $arrivalTime = strtotime($flightDetails['flight']->arrival_time);

                    // Validación de escala temporal (mínimo 45 min, máximo 48 hs)
                    if ($lastArrivalTime !== null) {
                        $minScalesTime = $lastArrivalTime + (45 * 60); 
                        if ($departureTime < $minScalesTime) {
                            continue; 
                        }
                        
                        $maxScalesTime = $lastArrivalTime + (48 * 60 * 60);
                        if ($departureTime > $maxScalesTime) {
                            continue; 
                        }
                    }

                    $currentPathFlights[] = $flightDetails;
                    
                    // 🔹 LLAMADA RECURSIVA: Pasamos $depth + 1 para controlar las escalas
                    $this->dfs(
                        $nextAirport, 
                        $destination, 
                        $visited, 
                        $currentPathFlights, 
                        $allPaths, 
                        $arrivalTime,
                        $depth + 1 
                    );

                    array_pop($currentPathFlights);
                }
            }
        }

        $visited[$currentAirport] = false;
    }



    
    public function getGraph(){
        return $this->graph;
    }




}