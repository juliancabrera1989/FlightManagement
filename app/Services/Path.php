<?php
namespace App\Services;

use App\Models\Airport;
use App\Models\Flight;
use Illuminate\Support\Collection;

class Path
{
    public $airports;
    public $flights;
    public $total_cost;
    public $transhipments;
    public $final_arrival_time;

    public function __construct($airports, $flights, $total_cost, $transhipments, $final_arrival_time)
    {
        $this->airports = $airports;
        $this->flights = $flights;
        $this->total_cost = $total_cost;
        $this->transhipments = $transhipments;
        $this->final_arrival_time = $final_arrival_time;
    }
}

?>