<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create a notification for a user.
     *
     * @param  User        $user      The recipient
     * @param  string      $title     Short title shown in the bell dropdown
     * @param  string      $message   Full notification body
     * @param  int|null    $bookingId Optional booking reference
     */
    public function notify(User $user, string $title, string $message, ?int $bookingId = null): Notification
    {
        return Notification::create([
            'user_id'    => $user->id,
            'booking_id' => $bookingId,
            'title'      => $title,
            'message'    => $message,
            'is_read'    => false,
        ]);
    }
}
