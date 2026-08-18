<?php
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

        if ($pathIds === null) {
            return null; 
        }

        $flights = collect();
        $total_cost = 0;
        $total_distance = 0;
        $first_departure_time = null;
        $last_arrival_time = null;

        $graph = $this->graphService->getGraph();

        // Recorremos los tramos decididos por Dijkstra
        for ($i = 0; $i < count($pathIds) - 1; $i++) {
            $u = $pathIds[$i];
            $v = $pathIds[$i + 1];
            
            // 🔹 Buscamos el vuelo específico dentro de la lista que cumpla mejor el criterio
            $listOfFlights = $graph[$u][$v];
            $bestFlightDetails = null;
            $bestWeight = INF;

            foreach ($listOfFlights as $flightDetails) {
                if ($flightDetails[$criteria] < $bestWeight) {
                    $bestWeight = $flightDetails[$criteria];
                    $bestFlightDetails = $flightDetails;
                }
            }

            // Sumamos las estadísticas de ese vuelo ganador
            $flights->push($bestFlightDetails['flight']);
            $total_cost += $bestFlightDetails['cost'];
            $total_distance += $bestFlightDetails['distance'];

            if ($first_departure_time === null || $bestFlightDetails['flight']->departure_time < $first_departure_time) { 
                $first_departure_time = $bestFlightDetails['flight']->departure_time; 
            } 
            if ($last_arrival_time === null || $bestFlightDetails['flight']->arrival_time > $last_arrival_time) { 
                $last_arrival_time = $bestFlightDetails['flight']->arrival_time; 
            }  
        }

        $transhipments = $flights->count() - 1;
        $final_arrival_time = $flights->isNotEmpty() ? $flights->last()->arrival_time : null;
        $total_time = Carbon::parse($first_departure_time)->diffInMinutes(Carbon::parse($last_arrival_time));   

        $departureAirports = $flights->pluck('departureAirport')->all();
        $arrivalAirports = $flights->pluck('arrivalAirport')->all();
        $airports = array_merge($departureAirports, $arrivalAirports);
        $airports = array_values(array_unique($airports, SORT_REGULAR));

        return new Path(
            $airports,
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
            $path = $this->buildPath($departure_airport_id, $arrival_airport_id, $criterion);
            if ($path !== null) {
                $paths[$criterion] = $path;
            }
        }

        return $paths;
    }





/**
     * Obtiene todas las rutas alternativas posibles entre dos aeropuertos usando el DFS.
     */
    public function getAllAlternativePaths($departure_airport_id, $arrival_airport_id)
    {
        // 1. Ejecutamos el DFS que programamos en el GraphService
        $rawPaths = $this->graphService->findAllPaths($departure_airport_id, $arrival_airport_id);

        $processedPaths = collect();

        // 2. Iteramos sobre cada combinación de vuelos encontrada
        foreach ($rawPaths as $flightRoute) {
            $flights = collect();
            $total_cost = 0;
            $total_distance = 0;
            $first_departure_time = null;
            $last_arrival_time = null;

            $airportsIds = [];

            foreach ($flightRoute as $flightDetails) {
                $flight = $flightDetails['flight'];
                
                $flights->push($flight);
                $total_cost += $flightDetails['cost'];
                $total_distance += $flightDetails['distance'];

                // Guardamos los IDs de aeropuertos para armar la lista de nodos ordenados
                $airportsIds[] = $flight->departure_airport_id;
                $airportsIds[] = $flight->arrival_airport_id;

                // Calculamos tiempos extremos de la ruta actual
                if ($first_departure_time === null || $flight->departure_time < $first_departure_time) { 
                    $first_departure_time = $flight->departure_time; 
                } 
                if ($last_arrival_time === null || $flight->arrival_time > $last_arrival_time) { 
                    $last_arrival_time = $flight->arrival_time; 
                }  
            }

            // Limpiamos duplicados de aeropuertos manteniendo el orden estricto de la ruta
            $airportsIds = array_values(array_unique($airportsIds));
            
            // Buscamos los objetos de los aeropuertos en base a los IDs recolectados
            $airports = \App\Models\Airport::whereIn('id', $airportsIds)
                            ->get()
                            ->sortBy(function ($airport) use ($airportsIds) {
                                return array_search($airport->id, $airportsIds);
                            })
                            ->values()
                            ->all();

            $transhipments = $flights->count() - 1;
            $final_arrival_time = $flights->isNotEmpty() ? $flights->last()->arrival_time : null;
            $total_time = Carbon::parse($first_departure_time)->diffInMinutes(Carbon::parse($last_arrival_time));

            // Instanciamos el objeto Path con la estructura que ya manejas
            $processedPaths->push(new Path(
                $airports,
                $flights,
                $total_cost,
                $transhipments,
                $final_arrival_time,
                $total_distance,
                $total_time
            ));
        }

        // 3. Devolvemos las opciones ordenadas por costo (puedes cambiarlo si prefieres por tiempo)
        return $processedPaths->sortBy('total_cost')->values();
    }

    
}