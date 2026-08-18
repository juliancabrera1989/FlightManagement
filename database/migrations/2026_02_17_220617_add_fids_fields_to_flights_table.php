<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::table('flights', function (Blueprint $table) {
        $table->string('gate')->nullable();
        $table->string('terminal')->nullable();
        $table->string('checkin_rows')->nullable();
        $table->string('status')->default('SCHEDULED');
    });
}

public function down(): void
{
    Schema::table('flights', function (Blueprint $table) {
        $table->dropColumn([
            'gate',
            'terminal',
            'checkin_rows',
            'status'
        ]);
    });
}

};
