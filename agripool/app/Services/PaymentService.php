<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Razorpay\Api\Api;
use Exception;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    protected $api;
    protected $keyId;
    protected $keySecret;

    public function __construct()
    {
        $this->keyId = config('services.razorpay.key_id');
        $this->keySecret = config('services.razorpay.key_secret');
        if ($this->keyId && $this->keySecret) {
            $this->api = new Api($this->keyId, $this->keySecret);
        }
    }

    public function createOrder(Booking $booking): array
    {
        if (!$this->api) {
            throw new Exception('Razorpay keys are not configured.');
        }

        $amountPaise = (int) ($booking->total_cost * 100);

        $orderData = [
            'receipt'         => 'booking_' . $booking->id,
            'amount'          => $amountPaise,
            'currency'        => 'INR',
            'payment_capture' => 1 // auto capture
        ];

        $razorpayOrder = $this->api->order->create($orderData);

        $payment = Payment::create([
            'booking_id'        => $booking->id,
            'farmer_id'         => $booking->farmer_id,
            'razorpay_order_id' => $razorpayOrder['id'],
            'amount'            => $booking->total_cost,
            'currency'          => 'INR',
            'status'            => 'created'
        ]);

        return [
            'razorpay_order_id' => $razorpayOrder['id'],
            'amount_paise'      => $amountPaise,
            'key_id'            => $this->keyId,
            'booking_id'        => $booking->id,
            'farmer_name'       => auth()->user()->name,
            'farmer_email'      => auth()->user()->email,
            'farmer_phone'      => auth()->user()->phone ?? '',
        ];
    }

    public function verifyAndCapture(array $data): Payment
    {
        $orderId = $data['razorpay_order_id'];
        $paymentId = $data['razorpay_payment_id'];
        $signature = $data['razorpay_signature'];

        $expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $this->keySecret);

        $payment = Payment::where('razorpay_order_id', $orderId)->firstOrFail();

        if ($expectedSignature !== $signature) {
            $payment->update(['status' => 'failed']);
            throw new Exception('Payment verification failed.');
        }

        $payment->update([
            'status'              => 'paid',
            'razorpay_payment_id' => $paymentId,
            'razorpay_signature'  => $signature,
            'paid_at'             => now()
        ]);

        $booking = $payment->booking;
        $booking->update(['status' => 'confirmed']);

        // Notification for the transporter
        $transporterId = $booking->vehicle->user_id ?? null;
        if ($transporterId) {
            \App\Models\Notification::create([
                'user_id' => $transporterId,
                'title'   => 'Payment Received',
                'message' => "Payment received for Booking #{$booking->id}. ₹{$payment->amount}",
                'type'    => 'payment',
                'related_id' => $booking->id
            ]);
        }

        return $payment;
    }
}
