<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackingUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'status',
        'current_lat',
        'current_lng',
        'notes',
        'recorded_at',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
