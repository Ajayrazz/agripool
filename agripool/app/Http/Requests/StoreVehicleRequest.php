<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
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
            'registration_no' => 'required|string|unique:vehicles',
            'vehicle_type' => 'required|in:truck,mini-truck,pickup',
            'total_capacity_kg' => 'required|numeric|min:0.1',
            'model' => 'required|string|max:255',
            'is_available' => 'boolean',
        ];
    }
}
