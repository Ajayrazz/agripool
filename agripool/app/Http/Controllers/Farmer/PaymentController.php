<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Services\PaymentService;
use Exception;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function createOrder(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id'
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        // Check ownership and status
        if ($booking->farmer_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized access to booking.'], 403);
        }

        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Booking is not in pending status.'], 422);
        }

        try {
            $data = $this->paymentService->createOrder($booking);
            return response()->json($data);
        } catch (Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function verify(Request $request)
    {
        $request->validate([
            'razorpay_order_id'   => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature'  => 'required|string',
        ]);

        try {
            $payment = $this->paymentService->verifyAndCapture($request->all());
            return response()->json([
                'success' => true,
                'message' => 'Payment successful! Your booking is now confirmed.',
                'payment' => $payment
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}
