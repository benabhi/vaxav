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
        Schema::create('banned_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('banned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('reason')->nullable()->comment('Short reason visible to the user');
            $table->text('notes')->nullable()->comment('Detailed notes for administrators');
            $table->enum('type', ['permanent', 'temporary'])->default('temporary');
            $table->timestamp('expires_at')->nullable()->comment('NULL for permanent bans');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banned_users');
    }
};
