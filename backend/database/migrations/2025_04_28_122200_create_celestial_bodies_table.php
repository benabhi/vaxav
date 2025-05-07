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
        Schema::create('celestial_bodies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('solar_system_id')->constrained()->onDelete('cascade');
            $table->foreignId('celestial_type_id')->constrained()->onDelete('restrict');
            $table->foreignId('parent_id')->nullable()->references('id')->on('celestial_bodies')->onDelete('cascade');
            $table->integer('orbit_index')->nullable();
            $table->float('coordinates_x');
            $table->float('coordinates_y');
            $table->timestamps();
            
            // Índices
            $table->index('name');
            
            // Restricción única para evitar duplicados en órbitas
            $table->unique(['parent_id', 'orbit_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('celestial_bodies');
    }
};
