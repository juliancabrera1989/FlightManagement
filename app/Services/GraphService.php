<?php
namespace App\Services;

use App\Models\Airport;
use App\Models\Flight;
// use League\Geotools\Coordinate\Coordinate;
// use League\Geotools\Geotools\Distance\Vincenty;
// use League\Geotools\Geotools;
use SplPriorityQueue;

class GraphService
{
    protected $graph = [];

    public function __construct()
    {
        $this->buildGraph();
    }

    protected function buildGraph()
    {
        $flights = Flight::all();
        foreach ($flights as $flight) {
            $this->graph[$flight->departure_airport_id][] = [
                'destination' => $flight->arrival_airport_id,
                'cost' => $flight->cost,
                'distance' => $this->calculateDistance(
                    $flight->departureAirport->latitude,
                    $flight->departureAirport->longitude,
                    $flight->arrivalAirport->latitude,
                    $flight->arrivalAirport->longitude
                ),
                'flight' => $flight
            ];
        }
    }

    // protected function calculateDistance($lat1, $lng1, $lat2, $lng2)
    // {
    //     $coordA = new Coordinate([$lat1, $lng1]);
    //     $coordB = new Coordinate([$lat2, $lng2]);
    //     $geotools = new Geotools();
    //     $distance = $geotools->distance()->setFrom($coordA)->setTo($coordB)->in('km')->haversine();
    //     return $distance;
    // }



    protected function calculateDistance($lat1, $lon1, $lat2, $lon2)
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



    public function dijkstra($start, $end, $criteria = 'distance')
    {
        $distances = [];
        $previous = [];
        $queue = new SplPriorityQueue();

        foreach ($this->graph as $vertex => $neighbors) {
            $distances[$vertex] = INF;
            $previous[$vertex] = null;
            $queue->insert($vertex, INF);
        }
        $distances[$start] = 0;
        $queue->insert($start, 0);

        while (!$queue->isEmpty()) {
            $u = $queue->extract();

            if ($u === $end) {
                $path = [];
                while ($previous[$u] !== null) {
                    $path[] = $u;
                    $u = $previous[$u];
                }
                $path[] = $start;
                return array_reverse($path);
            }

            if (!isset($this->graph[$u])) {
                continue;
            }

            foreach ($this->graph[$u] as $neighbor) {
                $alt = $distances[$u] + $neighbor[$criteria];
                if ($alt < $distances[$neighbor['destination']]) {
                    $distances[$neighbor['destination']] = $alt;
                    $previous[$neighbor['destination']] = $u;
                    $queue->insert($neighbor['destination'], -$alt);
                }
            }
        }

        return [];
    }
}
?>