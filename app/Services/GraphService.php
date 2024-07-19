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
            $this->graph[$flight->departure_airport_id][$flight->arrival_airport_id] = [
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
        // Radius of the earth in meters
        $earthRadius = 6371000;

        // Convert degrees to radians
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        // Haversine formula
        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;
        $a = sin($dlat / 2) * sin($dlat / 2) + cos($lat1) * cos($lat2) * sin($dlon / 2) * sin($dlon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        // Distance in meters
        $distance = $earthRadius * $c;

        return $distance;
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

            foreach ($this->graph[$u] as $v => $details) {
                $alt = $dist[$u] + $details[$criteria];

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
            return null; // No path found
        }

        array_unshift($path, $start);

        return $path;
    }

    public function getGraph(){
        return $this->graph;
        
    }
}
