<?php



namespace Database\Seeders;



use Illuminate\Database\Seeder;

use App\Models\Flight;

use App\Models\Airport;

use App\Models\Airline;

use Carbon\Carbon;



class FlightSeeder extends Seeder

{

    public function run()

    {

        // Limpiamos vuelos viejos estáticos

        Flight::truncate();



        $airports = Airport::all();

        $airlines = Airline::all();



        if ($airports->count() < 2 || $airlines->count() == 0) {

            return; // Seguridad por si no hay datos cargados

        }



        $statuses = ['Scheduled', 'Boarding', 'Delayed', 'In Flight', 'Cancelled', 'Landed'];



        // Generamos, por ejemplo, 300 vuelos dinámicos bien distribuidos

        for ($i = 0; $i < 300; $i++) {

            $origin = $airports->random();

            // Nos aseguramos de que el destino no sea igual al origen

            $destination = $airports->where('id', '!=', $origin->id)->random();

            $airline = $airlines->random();

            

            // Generamos fechas aleatorias entre -1 día (ayer) y +15 días en el futuro

            $daysOffset = rand(-1, 15);

            $departureTime = Carbon::now()->addDays($daysOffset)->hour(rand(0, 23))->minute(rand(0, 59));

            $duration = rand(60, 720); // duración en minutos (1h a 12h)

            $arrivalTime = (clone $departureTime)->addMinutes($duration);



            // Asignación lógica de estados según la fecha simulada

            if ($departureTime->isPast()) {

                $status = rand(0, 10) > 8 ? 'Cancelled' : 'Landed';

            } elseif ($departureTime->diffInHours(Carbon::now()) <= 1 && $departureTime->isFuture()) {

                $status = rand(0, 10) > 5 ? 'Boarding' : 'Delayed';

            } else {

                $status = rand(0, 10) > 8 ? 'Cancelled' : 'Scheduled';

            }



Flight::create([
    'flight_number' => $airline->code . str_pad(rand(10, 99) . $i, 4, '0', STR_PAD_LEFT), 
    'airline_id' => $airline->id,
    'departure_airport_id' => $origin->id,
    'arrival_airport_id' => $destination->id,
    'departure_time' => $departureTime,
    'arrival_time' => $arrivalTime,
    'duration' => $duration,
    'ticket_cost' => rand(150, 1200),
    'status' => $status,
    'gate' => rand(0, 10) > 3 ? 'Gate ' . rand(1, 25) : null,
]);

        }

    }

}