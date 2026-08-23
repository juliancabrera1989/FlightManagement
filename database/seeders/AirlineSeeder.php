<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Airline;

class AirlineSeeder extends Seeder
{
    public function run()
    {
        $airlines = [
            1  => ['name' => 'American Airlines', 'code' => 'AA'],
            2  => ['name' => 'Delta Air Lines', 'code' => 'DL'],
            3  => ['name' => 'United Airlines', 'code' => 'UA'],
            4  => ['name' => 'Lufthansa', 'code' => 'LH'],
            5  => ['name' => 'British Airways', 'code' => 'BA'],
            6  => ['name' => 'Air France', 'code' => 'AF'],
            7  => ['name' => 'Air Canada', 'code' => 'AC'],
            8  => ['name' => 'Iberia', 'code' => 'IB'],
            9  => ['name' => 'Emirates', 'code' => 'EK'],
            10 => ['name' => 'Qatar Airways', 'code' => 'QR'],
            11 => ['name' => 'Japan Airlines', 'code' => 'JL'],
            12 => ['name' => 'All Nippon Airways', 'code' => 'NH'],
            13 => ['name' => 'LATAM Airlines', 'code' => 'LA'],
            14 => ['name' => 'Aerolíneas Argentinas', 'code' => 'AR'],
            15 => ['name' => 'Gol Transportes Aéreos', 'code' => 'G3'],
            16 => ['name' => 'Qantas', 'code' => 'QF'],
            17 => ['name' => 'Singapore Airlines', 'code' => 'SQ'],
            18 => ['name' => 'Alaska Airlines', 'code' => 'AS'],
            19 => ['name' => 'Southwest Airlines', 'code' => 'WN'],
        ];

        foreach ($airlines as $id => $data) {
            $codeLower = strtolower($data['code']);
            
            Airline::updateOrCreate(
                ['id' => $id],
                [
                    'name'      => $data['name'],
                    'code'      => $data['code'],
                    'logo_path' => "/logos/{$codeLower}.png", // ej: /logos/aa.png
                ]
            );
        }
    }
}