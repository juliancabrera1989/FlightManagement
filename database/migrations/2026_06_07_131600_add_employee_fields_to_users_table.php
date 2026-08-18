<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint; // 👈 Asegurate de que este use esté bien
use Illuminate\Support\Facades\Schema;   // 👈 Asegurate de que este use esté bien

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) { // 👈 Cambiado Schema por Blueprint
            $table->string('employee_type')->nullable()->after('role'); // 'airline' o 'airport'
            
            $table->unsignedBigInteger('airline_id')->nullable()->after('employee_type');
            $table->unsignedBigInteger('airport_id')->nullable()->after('airline_id');

            // Restricciones relacionales
            $table->foreign('airline_id')->references('id')->on('airlines')->onDelete('set null');
            $table->foreign('airport_id')->references('id')->on('airports')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) { // 👈 Cambiado Schema por Blueprint
            $table->dropForeign(['airline_id']);
            $table->dropForeign(['airport_id']);
            $table->dropColumn(['employee_type', 'airline_id', 'airport_id']);
        });
    }
};