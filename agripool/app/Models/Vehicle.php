<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'registration_no',
        'vehicle_type',
        'total_capacity_kg',
        'remaining_capacity_kg',
        'model',
        'is_available',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function routes()
    {
        return $this->hasMany(VehicleRoute::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
