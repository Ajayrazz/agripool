<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\TransportRequest;
use App\Http\Requests\StoreTransportRequest;
use Illuminate\Http\Request;

class RequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = $request->user()
            ->transportRequests()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($requests);
    }

    public function store(StoreTransportRequest $request)
    {
        $transportRequest = $request->user()->transportRequests()->create($request->validated());

        return response()->json($transportRequest, 201);
    }

    public function show(Request $request, $id)
    {
        $transportRequest = $request->user()->transportRequests()->findOrFail($id);

        return response()->json($transportRequest);
    }

    public function destroy(Request $request, $id)
    {
        $transportRequest = $request->user()->transportRequests()->findOrFail($id);

        if ($transportRequest->status !== 'open') {
            return response()->json(['message' => 'Only open requests can be cancelled.'], 403);
        }

        $transportRequest->delete();

        return response()->json(['message' => 'Request cancelled successfully.']);
    }
}
