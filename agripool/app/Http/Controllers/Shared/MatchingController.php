<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\MatchingService;
use App\Models\TransportRequest;

class MatchingController extends Controller
{
    protected $matchingService;

    public function __construct(MatchingService $matchingService)
    {
        $this->matchingService = $matchingService;
    }

    public function index(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:transport_requests,id'
        ]);

        $transportRequest = TransportRequest::findOrFail($request->request_id);

        if ($transportRequest->farmer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access to this request matches.'], 403);
        }

        $matches = $this->matchingService->findMatches($transportRequest)->paginate(10);

        return response()->json($matches);
    }
}
