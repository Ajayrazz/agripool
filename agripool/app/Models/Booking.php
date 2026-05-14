<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'vehicle_id',
        'request_id',
        'booked_weight_kg',
        'total_cost',
        'status',
        'cancellation_reason',
        'dispute_resolution',
    ];

    public function farmer()
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function transportRequest()
    {
        return $this->belongsTo(TransportRequest::class, 'request_id');
    }

    public function trackingUpdates()
    {
        return $this->hasMany(TrackingUpdate::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
}
