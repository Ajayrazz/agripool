<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Extend the tracking_updates status enum to include 'completed'.
 * MySQL requires MODIFY COLUMN to change an enum.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tracking_updates', function (Blueprint $table) {
            $table->enum('status', ['pending', 'confirmed', 'in_transit', 'delivered', 'completed'])
                  ->change();
        });
    }

    public function down(): void
    {
        Schema::table('tracking_updates', function (Blueprint $table) {
            $table->enum('status', ['pending', 'confirmed', 'in_transit', 'delivered'])
                  ->change();
        });
    }
};
