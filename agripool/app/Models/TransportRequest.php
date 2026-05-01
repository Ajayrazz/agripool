<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransportRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'pickup_location',
        'destination',
        'pickup_lat',
        'pickup_lng',
        'cargo_weight_kg',
        'produce_type',
        'required_date',
        'status',
    ];

    public function farmer()
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'request_id');
    }
}
