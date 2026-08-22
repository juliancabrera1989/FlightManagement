<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        User::create([
            'name'          => 'System Admin',
            'email'         => 'admin@flightradar.com',
            'password'      => Hash::make('admin123'),
            'role'          => 'admin',
            'employee_type' => null,
            'airline_id'    => null,
            'airport_id'    => null,
        ]);
    }
}
