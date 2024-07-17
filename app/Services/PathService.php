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

        $total_cost = $flights->sum('cost');
        $transhipments = $flights->count() - 1;
        $final_arrival_time = $flights->max('arrival_time');

        return new Path($airports, $flights, $total_cost, $transhipments, $final_arrival_time);
    }
}


?>





