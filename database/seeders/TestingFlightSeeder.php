<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Flight;
use App\Models\Airport;
use App\Models\Airline;
use Carbon\Carbon;

class TestingFlightSeeder extends Seeder
{
    public function run()
    {
        // Vaciamos vuelos previos para limpiar el radar de pruebas
        Flight::truncate();

        // Tomamos datos reales de tu base de datos
        $airports = Airport::all();
        $airlines = Airline::all();

        if ($airports->count() < 3 || $airlines->count() < 2) {
            $this->command->error("Faltan datos de base (mínimo 3 aeropuertos y 2 aerolíneas) para correr el test.");
            return;
        }

        // Fijamos los IDs reales para los escenarios controlados
        $originId = $airports[0]->id;       // Tu primer aeropuerto (Ej: Base de operaciones)
        $destinationId = $airports[1]->id;  // Tu segundo aeropuerto
        $alternateDestId = $airports[2]->id;// Tu tercer aeropuerto

        $myAirlineId = $airlines[0]->id;    // La aerolínea asignada a tu empleado (Gastón)
        $otherAirlineId = $airlines[1]->id; // Otra aerolínea competitiva

        // 📅 FECHA OBJETIVO EXACTA PARA TESTING
        $targetDate = '2026-10-15';

        // CASO 1: Vuelo Programado Comercial (Apto Pasajeros, Aerolínea de Gastón, Sale de Base)
        Flight::create([
            'flight_number' => 'TS-1300',
            'airline_id' => $myAirlineId, 
            'departure_airport_id' => $originId, 
            'arrival_airport_id' => $destinationId,   
            'departure_time' => Carbon::parse("$targetDate 08:00:00"),
            'arrival_time' => Carbon::parse("$targetDate 18:30:00"),
            'duration' => 630,
            'ticket_cost' => 850.00,
            'status' => 'Scheduled',
        ]);

        // CASO 2: Vuelo Cancelado (Invisible para pasajeros, visible para Gastón)
        Flight::create([
            'flight_number' => 'TS-1302',
            'airline_id' => $myAirlineId, 
            'departure_airport_id' => $originId, 
            'arrival_airport_id' => $alternateDestId, 
            'departure_time' => Carbon::parse("$targetDate 14:15:00"),
            'arrival_time' => Carbon::parse("$targetDate 23:20:00"),
            'duration' => 545,
            'ticket_cost' => 720.00,
            'status' => 'Cancelled',
        ]);

        // CASO 3: Vuelo de OTRA Aerolínea llegando a tu Base (Arribo para empleado de aeropuerto)
        Flight::create([
            'flight_number' => 'EXT-982',
            'airline_id' => $otherAirlineId, 
            'departure_airport_id' => $destinationId, 
            'arrival_airport_id' => $originId, // Destino es la Base del aeropuerto
            'departure_time' => Carbon::parse("$targetDate 01:00:00"),
            'arrival_time' => Carbon::parse("$targetDate 11:15:00"),
            'duration' => 615,
            'ticket_cost' => 990.00,
            'status' => 'Scheduled',
        ]);

        $this->command->info("¡Entorno de testing comercial/operativo para el 15 Oct 2026 cargado con éxito!");
    }
}