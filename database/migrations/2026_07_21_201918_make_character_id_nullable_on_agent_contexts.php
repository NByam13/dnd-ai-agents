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
        Schema::table('agent_contexts', function (Blueprint $table) {
            // The Dungeon Master has no Character of its own, so its context row
            // carries a null character_id.
            $table->foreignId('character_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('agent_contexts', function (Blueprint $table) {
            $table->foreignId('character_id')->nullable(false)->change();
        });
    }
};
