<?php
namespace App\Services;

use App\Models\Flight;
use App\Models\Airport;
use Carbon\Carbon;

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
            $this->graph[$flight->departure_airport_id][$flight->arrival_airport_id][] = [
                'distance' => $this->calculateDistance(
                    $flight->departureAirport->latitude,
                    $flight->departureAirport->longitude,
                    $flight->arrivalAirport->latitude,
                    $flight->arrivalAirport->longitude
                ),
                'cost' => $flight->ticket_cost,
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


    /**
     * Dijkstra dinámico adaptado a cotas temporales y pesos reales
     */
    public function dijkstra($start, $end, $criteria, $startDate = null, $endDate = null)
    {
        $dist = [];
        $prev = [];
        $bestFlightUsed = []; // Guarda el vuelo específico elegido en cada nodo
        $arrivalTimeAtNode = []; // Guarda el timestamp de llegada a cada aeropuerto
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

                    // 🔴 FILTRO 1: Respetar Cota Inferior ($startDate)
                    if ($startTimestamp && $depTime < $startTimestamp) {
                        continue;
                    }

                    // 🔴 FILTRO 2: Respetar Cota Superior ($endDate)
                    if ($endTimestamp && $arrTime > $endTimestamp) {
                        continue;
                    }

                    // 🔴 FILTRO 3: Escala lógica (SE REQUERE SIEMPRE QUE NO SEA EL NODO INICIAL)
                    // Garantiza que la salida del siguiente tramo sea posterior a la llegada del anterior (mínimo 45 min, máximo 48 hs)
                    if ($u != $start && $arrivalTimeAtNode[$u] !== null) {
                        $minScale = $arrivalTimeAtNode[$u] + (45 * 60); // 45 minutos mínimo de conexión
                        $maxScale = $arrivalTimeAtNode[$u] + (48 * 60 * 60); //48 horas máximo
                        if ($depTime < $minScale || $depTime > $maxScale) {
                            continue;
                        }
                    }

                    // Cálculo del peso según criterio
                    if ($criteria === 'time') {
                        // El peso para TIEMPO es la hora absoluta de llegada al destino del tramo
                        $weight = $arrTime;
                    } else {
                        $weight = $flightDetails[$criteria];
                    }

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

        if ($dist[$end] === INF) {
            return null;
        }

        // Reconstrucción de la ruta en nodos (IDs de aeropuertos)
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

    /**
     * DFS para Explorar Todas las Alternativas con Cotas
     */
    public function findAllPaths($start, $end, $startDate = null, $endDate = null)
    {
        $allPaths = [];
        $visited = [];

        $startTimestamp = $startDate ? strtotime($startDate) : null;
        $endTimestamp = $endDate ? strtotime($endDate) : null;

        $this->dfs($start, $end, $visited, [], $allPaths, null, 0, $startTimestamp, $endTimestamp);

        return $allPaths;
    }

protected function dfs(
        $currentAirport, 
        $destination, 
        &$visited, 
        $currentPathFlights, 
        &$allPaths, 
        $lastArrivalTime, 
        $depth, 
        $startTimestamp, 
        $endTimestamp,
        $maxPaths = 50
    ) {
        // 1. Freno por cantidad de rutas
        if (count($allPaths) >= $maxPaths) {
            return;
        }

        // 2. Freno por escalas máximas
        if ($depth > 3) {
            return;
        }

        // 3. Caso Éxito
        if ($currentAirport == $destination) {
            $allPaths[] = $currentPathFlights;
            return;
        }

        $visited[$currentAirport] = true;

        if (isset($this->graph[$currentAirport])) {
            foreach ($this->graph[$currentAirport] as $nextAirport => $listOfFlights) {
                
                // Evitar ciclos
                if (isset($visited[$nextAirport]) && $visited[$nextAirport]) {
                    continue;
                }

                foreach ($listOfFlights as $flightDetails) {
                    if (count($allPaths) >= $maxPaths) {
                        break;
                    }

                    $depTime = strtotime($flightDetails['flight']->departure_time);
                    $arrTime = strtotime($flightDetails['flight']->arrival_time);

                    // ⚠️ SI TIENE CONEXIÓN: Solo pedir que el siguiente vuelo salga DESPUÉS del que llegó
                    // (Quitamos temporalmente la restricción estricta de fechas globales para probar)
                    if ($lastArrivalTime !== null && $depTime < $lastArrivalTime) {
                        continue;
                    }

                    $currentPathFlights[] = $flightDetails;

                    $this->dfs(
                        $nextAirport, 
                        $destination, 
                        $visited, 
                        $currentPathFlights, 
                        $allPaths, 
                        $arrTime,
                        $depth + 1,
                        $startTimestamp,
                        $endTimestamp,
                        $maxPaths
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