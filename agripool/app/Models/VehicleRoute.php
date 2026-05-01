<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'origin',
        'destination',
        'origin_lat',
        'origin_lng',
        'dest_lat',
        'dest_lng',
        'departure_date',
        'departure_time',
        'price_per_kg',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
