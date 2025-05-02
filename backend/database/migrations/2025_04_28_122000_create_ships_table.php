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
        Schema::create('ships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('pilot_id')->constrained()->onDelete('cascade');
            $table->foreignId('ship_type_id')->constrained()->onDelete('restrict');
            $table->decimal('shield', 10, 2)->default(0);
            $table->decimal('armor', 10, 2)->default(0);
            $table->decimal('structure', 10, 2)->default(0);
            $table->decimal('cargo_capacity', 10, 2)->default(0);
            $table->decimal('speed', 10, 2)->default(0);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ships');
    }
};
