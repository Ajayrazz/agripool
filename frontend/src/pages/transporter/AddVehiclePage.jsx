import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';

const AddVehiclePage = () => {
    const [formData, setFormData] = useState({
        registration_no: '',
        vehicle_type: 'truck',
        total_capacity_kg: '',
        model: '',
        is_available: true
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({...formData, [e.target.name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await api.post('/transporter/vehicles', formData);
            navigate('/transporter/fleet');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add vehicle');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-container" style={{ maxWidth: '600px' }}>
            <div className="mb-6">
                <Link to="/transporter/fleet" className="text-sm text-green-600 hover:underline mb-2 inline-block">
                    &larr; Back to Fleet
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Vehicle</h1>
                <p className="text-sm text-gray-500 mt-1">Register a new vehicle to your fleet to start scheduling routes.</p>
            </div>

            <div className="card">
                {error && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Registration No.</label>
                        <input 
                            type="text" 
                            name="registration_no" 
                            value={formData.registration_no} 
                            onChange={handleChange} 
                            placeholder="e.g. MH12 AB 1234"
                            required 
                            className="form-input uppercase" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Model</label>
                        <input 
                            type="text" 
                            name="model" 
                            value={formData.model} 
                            onChange={handleChange} 
                            placeholder="e.g. Tata Ace, Mahindra Bolero"
                            required 
                            className="form-input" 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Vehicle Type</label>
                            <select 
                                name="vehicle_type" 
                                value={formData.vehicle_type} 
                                onChange={handleChange} 
                                className="form-input bg-white"
                            >
                                <option value="truck">Truck</option>
                                <option value="mini-truck">Mini Truck</option>
                                <option value="pickup">Pickup</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Total Capacity (kg)</label>
                            <input 
                                type="number" 
                                name="total_capacity_kg" 
                                step="0.1" 
                                value={formData.total_capacity_kg} 
                                onChange={handleChange} 
                                placeholder="e.g. 1000"
                                required 
                                className="form-input" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn-primary w-full sm:w-auto justify-center"
                        >
                            {isSubmitting ? 'Adding Vehicle...' : 'Add Vehicle'}
                        </button>
                        <Link to="/transporter/fleet" className="btn-secondary w-full sm:w-auto justify-center">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default AddVehiclePage;
