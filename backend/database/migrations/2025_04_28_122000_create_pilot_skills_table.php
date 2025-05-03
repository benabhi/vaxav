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
        Schema::create('skills_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->timestamps();
        });

        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_category_id')->constrained('skills_categories')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->unsignedTinyInteger('multiplier');
            $table->timestamps();
        });

        Schema::create('skills_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('skill_id')->constrained('skills')->onDelete('cascade');
            $table->foreignId('prerequisite_id')->constrained('skills')->onDelete('cascade');
            $table->unsignedTinyInteger('prerequisite_level');
            $table->timestamps();
        });

        Schema::create('pilots_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pilot_id')->constrained()->onDelete('cascade');
            $table->foreignId('skill_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('xp')->default(0);
            $table->unsignedTinyInteger('current_level')->default(0);
            $table->boolean('active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pilots_skills');
        Schema::dropIfExists('skills_prerequisites');
        Schema::dropIfExists('skills');
        Schema::dropIfExists('skills_categories');
    }
};
