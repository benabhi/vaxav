<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ship_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('class');
            $table->text('description')->nullable();
            $table->decimal('base_shield', 10, 2);
            $table->decimal('base_armor', 10, 2);
            $table->decimal('base_structure', 10, 2);
            $table->decimal('base_cargo_capacity', 10, 2);
            $table->decimal('base_speed', 10, 2);
            $table->decimal('price', 20, 2);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ship_types');
    }
};
