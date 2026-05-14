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
        // Add new fields to users table
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('role');
            $table->boolean('is_suspended')->default(false)->after('is_verified');
        });
        
        // Modify the enum
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('farmer', 'transporter', 'admin') DEFAULT 'farmer'");

        // Add dispute_resolution to bookings table
        Schema::table('bookings', function (Blueprint $table) {
            $table->text('dispute_resolution')->nullable()->after('cancellation_reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('dispute_resolution');
        });

        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('farmer', 'transporter') DEFAULT 'farmer'");

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'is_suspended']);
        });
    }
};
