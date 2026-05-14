<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats()
    {
        $totalFarmers = User::where('role', 'farmer')->count();
        $totalTransporters = User::where('role', 'transporter')->count();
        $totalVehicles = Vehicle::count();
        $totalBookings = Booking::count();
        
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        
        $bookingsByStatus = [
            'pending' => Booking::where('status', 'pending')->count(),
            'confirmed' => Booking::where('status', 'confirmed')->count(),
            'in_transit' => Booking::where('status', 'in_transit')->count(),
            'delivered' => Booking::where('status', 'delivered')->count(),
            'cancelled' => Booking::where('status', 'cancelled')->count(),
        ];
        
        $thirtyDaysAgo = now()->subDays(30)->toDateString();
        $bookingsLast30DaysRaw = Booking::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        $bookingsLast30Days = [];
        foreach ($bookingsLast30DaysRaw as $b) {
            $bookingsLast30Days[] = [
                'date' => $b->date,
                'count' => $b->count
            ];
        }

        $topRoutesRaw = Booking::join('transport_requests', 'bookings.request_id', '=', 'transport_requests.id')
            ->select(
                DB::raw("CONCAT(transport_requests.pickup_location, ' → ', transport_requests.destination) as route"),
                DB::raw('count(*) as count')
            )
            ->groupBy('route')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        $topRoutes = [];
        foreach ($topRoutesRaw as $r) {
            $topRoutes[] = [
                'route' => $r->route,
                'count' => $r->count
            ];
        }

        $recentBookingsRaw = Booking::with(['farmer', 'vehicle.user', 'payment'])
            ->latest()
            ->limit(10)
            ->get();

        $recentBookings = [];
        foreach ($recentBookingsRaw as $b) {
            $recentBookings[] = [
                'id' => $b->id,
                'farmer_name' => $b->farmer->name ?? 'Unknown',
                'transporter_name' => $b->vehicle->user->name ?? 'Unknown',
                'vehicle' => $b->vehicle->model ?? 'Unknown',
                'amount' => $b->total_cost,
                'status' => $b->status,
            ];
        }

        return response()->json([
            'total_farmers' => $totalFarmers,
            'total_transporters' => $totalTransporters,
            'total_vehicles' => $totalVehicles,
            'total_bookings' => $totalBookings,
            'total_revenue' => $totalRevenue,
            'bookings_by_status' => $bookingsByStatus,
            'bookings_last_30_days' => $bookingsLast30Days,
            'top_routes' => $topRoutes,
            'recent_bookings' => $recentBookings,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->has('role') && $request->role != '') {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && $request->status != '') {
            $isVerified = filter_var($request->status, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_verified', $isVerified);
        }

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        $query->withCount([
            'bookings as bookings_count',
            'vehicles as vehicles_count'
        ]);

        $users = $query->paginate(20);

        return response()->json($users);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'is_verified' => 'boolean',
            'is_suspended' => 'boolean',
        ]);

        $user->update($data);

        if ($request->is_suspended) {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    public function allBookings(Request $request)
    {
        $query = Booking::with(['farmer', 'vehicle.user', 'payment']);

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('farmer', function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%");
            })->orWhereHas('vehicle', function($q) use ($search) {
                $q->where('registration_number', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('date_from') && $request->date_from != '') {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to != '') {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $bookings = $query->paginate(15);

        return response()->json($bookings);
    }

    public function disputes(Request $request)
    {
        $disputes = Booking::with(['farmer', 'vehicle.user', 'payment'])
            ->where('status', 'cancelled')
            ->whereNotNull('cancellation_reason')
            ->latest()
            ->get();

        $result = [];
        foreach ($disputes as $d) {
            $result[] = [
                'booking' => $d,
                'farmer_name' => $d->farmer->name ?? 'Unknown',
                'transporter_name' => $d->vehicle->user->name ?? 'Unknown',
                'vehicle' => $d->vehicle->model ?? 'Unknown',
                'cancellation_reason' => $d->cancellation_reason,
            ];
        }

        return response()->json($result);
    }

    public function resolveDispute(Request $request, Booking $booking)
    {
        $request->validate([
            'resolution' => 'required|string',
            'action' => 'required|in:refund_farmer,compensate_transporter,no_action',
        ]);

        $booking->update([
            'dispute_resolution' => $request->resolution
        ]);

        if ($request->action === 'refund_farmer' && $booking->payment) {
            $booking->payment->update(['status' => 'refunded']);
        }
        
        return response()->json(['message' => 'Dispute resolved successfully', 'booking' => $booking->fresh(['payment'])]);
    }
}
