<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pickup_location' => 'required|string|max:255',
            'destination' => 'required|string|max:255',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'cargo_weight_kg' => 'required|numeric|min:1',
            'produce_type' => 'required|string|max:255',
            'required_date' => 'required|date|after:today',
        ];
    }
}
