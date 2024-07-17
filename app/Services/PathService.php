<?php

namespace App\Services;

use App\Models\Flight;
use Carbon\Carbon;

class PathService
{
    public function buildPath($departure_airport_id, $arrival_airport_id)
    {
        // Fetch flights and airports based on the logic to find a path
        $flights = Flight::where('departure_airport_id', $departure_airport_id)
                          ->where('arrival_airport_id', $arrival_airport_id)
                          ->get();

        $airports = $flights->pluck('departureAirport')->merge($flights->pluck('arrivalAirport'))->unique('id');

        $total_cost = $flights->sum('ticket_cost');
        $transhipments = $flights->count() - 1;
        $final_arrival_time = $flights->max('arrival_time');

        $total_distance = 0;

        foreach ($flights as $flight) {
            $departureAirport = $flight->departureAirport;
            $arrivalAirport = $flight->arrivalAirport;

            $distance = $this->calculateDistance(
                $departureAirport->latitude,
                $departureAirport->longitude,
                $arrivalAirport->latitude,
                $arrivalAirport->longitude
            );

            $total_distance += $distance;
        }

        return new Path($airports, $flights, $total_cost, $transhipments, $final_arrival_time, $total_distance);
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
}
?>