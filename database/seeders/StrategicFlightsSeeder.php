<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Flight;
use App\Models\Airport;
use App\Models\Airline; // 🔹 Importamos el modelo de Aerolínea
use Carbon\Carbon;

class StrategicFlightsSeeder extends Seeder
{
    public function run()
    {
        // 1. Buscamos los aeropuertos clave
        $airports = Airport::whereIn('code', ['EZE', 'GRU', 'MIA', 'JFK', 'LHR', 'CDG', 'DXB', 'NRT', 'SYD'])
                           ->get()
                           ->keyBy('code');

        if ($airports->count() < 9) {
            $this->command->error("Faltan aeropuertos clave en la base de datos. Asegúrate de tener cargados todos.");
            return;
        }

        // 2. 🔹 Solución al error: Buscamos la primera aerolínea disponible o creamos una por defecto
        $airline = Airline::first();
        if (!$airline) {
            // Si no tienes ninguna aerolínea en la BD, creamos una de prueba
            $airline = Airline::create([
                'name' => 'Global Airways',
                'code' => 'GA'
                // Agrega aquí otros campos obligatorios de tu tabla airlines si los hay
            ]);
        }

        $baseDate = Carbon::now()->addDay()->startOfDay(); // Mañana a las 00:00

        $strategicFlights = [
            // ==========================================
            // RUTA 1: LATINOAMÉRICA A ASIA (Vía Miami y Tokio)
            // ==========================================
            [
                'flight_number' => 'AR1302',
                'departure_airport_id' => $airports['EZE']->id,
                'arrival_airport_id' => $airports['MIA']->id,
                'departure_time' => $baseDate->copy()->addHours(2), 
                'arrival_time' => $baseDate->copy()->addHours(11),  
                'ticket_cost' => 600,
                'duration' => 540,
                'airline_id' => $airline->id // 🔹 Asignamos el ID de la aerolínea
            ],
            [
                'flight_number' => 'AA201',
                'departure_airport_id' => $airports['MIA']->id,
                'arrival_airport_id' => $airports['NRT']->id,
                'departure_time' => $baseDate->copy()->addHours(15), 
                'arrival_time' => $baseDate->copy()->addDays(1)->addHours(5), 
                'ticket_cost' => 1100,
                'duration' => 840,
                'airline_id' => $airline->id
            ],

            // RUTA 1 ALTERNATIVA (EZE -> GRU -> MIA -> NRT)
            [
                'flight_number' => 'G37450',
                'departure_airport_id' => $airports['EZE']->id,
                'arrival_airport_id' => $airports['GRU']->id,
                'departure_time' => $baseDate->copy()->addHours(1), 
                'arrival_time' => $baseDate->copy()->addHours(4),   
                'ticket_cost' => 150,
                'duration' => 180,
                'airline_id' => $airline->id
            ],
            [
                'flight_number' => 'LA8102',
                'departure_airport_id' => $airports['GRU']->id,
                'arrival_airport_id' => $airports['MIA']->id,
                'departure_time' => $baseDate->copy()->addHours(7), 
                'arrival_time' => $baseDate->copy()->addHours(14),  
                'ticket_cost' => 350,
                'duration' => 420,
                'airline_id' => $airline->id
            ],
            [
                'flight_number' => 'JL017',
                'departure_airport_id' => $airports['MIA']->id,
                'arrival_airport_id' => $airports['NRT']->id,
                'departure_time' => $baseDate->copy()->addHours(18), 
                'arrival_time' => $baseDate->copy()->addDays(1)->addHours(8), 
                'ticket_cost' => 900,
                'duration' => 840,
                'airline_id' => $airline->id
            ],

            // ==========================================
            // RUTA 2: EUROPA A AUSTRALIA (Vía Dubái)
            // ==========================================
            [
                'flight_number' => 'BA207',
                'departure_airport_id' => $airports['LHR']->id,
                'arrival_airport_id' => $airports['DXB']->id,
                'departure_time' => $baseDate->copy()->addHours(10), 
                'arrival_time' => $baseDate->copy()->addHours(17),  
                'ticket_cost' => 400,
                'duration' => 420,
                'airline_id' => $airline->id
            ],
            [
                'flight_number' => 'EK414',
                'departure_airport_id' => $airports['DXB']->id,
                'arrival_airport_id' => $airports['SYD']->id,
                'departure_time' => $baseDate->copy()->addHours(21), 
                'arrival_time' => $baseDate->copy()->addDays(1)->addHours(11), 
                'ticket_cost' => 1200,
                'duration' => 840,
                'airline_id' => $airline->id
            ],
            [
                'flight_number' => 'AF1680',
                'departure_airport_id' => $airports['CDG']->id,
                'arrival_airport_id' => $airports['LHR']->id,
                'departure_time' => $baseDate->copy()->addHours(6),  
                'arrival_time' => $baseDate->copy()->addHours(7),  
                'ticket_cost' => 80,
                'duration' => 60,
                'airline_id' => $airline->id
            ],

            // ==========================================
            // RUTA 3: LATINOAMÉRICA A EUROPA (Directo vs Escala en NY)
            // ==========================================
            [
                'flight_number' => 'IB6844',
                'departure_airport_id' => $airports['EZE']->id,
                'arrival_airport_id' => $airports['LHR']->id,
                'departure_time' => $baseDate->copy()->addHours(22), 
                'arrival_time' => $baseDate->copy()->addDays(1)->addHours(11), 
                'ticket_cost' => 1500,
                'duration' => 780,
                'airline_id' => $airline->id
            ],
            [
                'flight_number' => 'DL114',
                'departure_airport_id' => $airports['EZE']->id,
                'arrival_airport_id' => $airports['JFK']->id,
                'departure_time' => $baseDate->copy()->addHours(20), 
                'arrival_time' => $baseDate->copy()->addDays(1)->addHours(6),  
                'ticket_cost' => 500,
                'duration' => 600,
                'airline_id' => $airline->id
            ],
            [
                'flight_number' => 'VS004',
                'departure_airport_id' => $airports['JFK']->id,
                'arrival_airport_id' => $airports['LHR']->id,
                'departure_time' => $baseDate->copy()->addDays(1)->addHours(10), 
                'arrival_time' => $baseDate->copy()->addDays(1)->addHours(17),  
                'ticket_cost' => 450,
                'duration' => 420,
                'airline_id' => $airline->id
            ],
        ];

        foreach ($strategicFlights as $data) {
            // Busca si el número de vuelo ya existe. 
            // Si existe, actualiza sus datos; si no existe, lo crea sin tocar el resto de la tabla.
            Flight::updateOrCreate(
                ['flight_number' => $data['flight_number']], 
                $data
            );
        }

        $this->command->info("¡Vuelos intercontinentales estratégicos cargados con éxito en la base de datos!");
    }
}