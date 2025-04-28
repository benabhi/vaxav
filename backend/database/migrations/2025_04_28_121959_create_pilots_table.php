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
        Schema::create('pilots', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('race');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('corporation_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('credits', 20, 2)->default(0);
            $table->foreignId('location_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pilots');
    }
};
