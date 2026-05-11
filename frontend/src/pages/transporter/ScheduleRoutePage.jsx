import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api';

const ScheduleRoutePage = () => {
    const { vehicleId } = useParams();
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        origin_lat: '',
        origin_lng: '',
        dest_lat: '',
        dest_lng: '',
        departure_date: '',
        departure_time: '',
        price_per_kg: ''
    });
    const [errors, setErrors] = useState({});
    const [globalError, setGlobalError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [geocodingStatus, setGeocodingStatus] = useState({ origin: '', destination: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleGeocode = async (type, value) => {
        if (!value) return;
        setGeocodingStatus(prev => ({ ...prev, [type]: 'Loading...' }));
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const latNum = parseFloat(lat);
                const lonNum = parseFloat(lon);
                setFormData(prev => ({
                    ...prev,
                    [`${type === 'origin' ? 'origin' : 'dest'}_lat`]: latNum,
                    [`${type === 'origin' ? 'origin' : 'dest'}_lng`]: lonNum
                }));
                setGeocodingStatus(prev => ({ ...prev, [type]: `Resolved: Lat ${latNum.toFixed(4)}, Lng ${lonNum.toFixed(4)}` }));
            } else {
                setGeocodingStatus(prev => ({ ...prev, [type]: 'Location not found' }));
            }
        } catch (err) {
            setGeocodingStatus(prev => ({ ...prev, [type]: 'Geocoding failed' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGlobalError(null);
        setIsSubmitting(true);
        try {
            await api.post(`/transporter/vehicles/${vehicleId}/routes`, formData);
            setSuccessMsg('Route scheduled successfully!');
            setTimeout(() => navigate('/transporter/fleet'), 1500);
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setGlobalError(err.response?.data?.message || 'Failed to schedule route');
            }
            setIsSubmitting(false);
        }
    };

    return (
        <main className="page-container" style={{ maxWidth: '700px' }}>
            <div className="mb-6">
                <Link to="/transporter/fleet" className="text-sm text-green-600 hover:underline mb-2 inline-block">
                    &larr; Back to Fleet Details
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Schedule New Route</h1>
                <p className="text-sm text-gray-500 mt-1">Create a transport route for farmers to book available capacity.</p>
            </div>

            <div className="card">
                {globalError && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {globalError}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        ✅ {successMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Origin</label>
                        <input 
                            type="text" 
                            name="origin" 
                            value={formData.origin} 
                            onChange={handleChange} 
                            onBlur={(e) => handleGeocode('origin', e.target.value)}
                            placeholder="Enter origin location (e.g. Mumbai)"
                            required 
                            className={`form-input ${errors.origin ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        <div className="flex justify-between mt-1">
                            <small className="text-xs text-gray-500">{geocodingStatus.origin}</small>
                            {errors.origin && <small className="text-xs text-red-500">{errors.origin[0]}</small>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Destination</label>
                        <input 
                            type="text" 
                            name="destination" 
                            value={formData.destination} 
                            onChange={handleChange} 
                            onBlur={(e) => handleGeocode('destination', e.target.value)}
                            placeholder="Enter destination location (e.g. Pune)"
                            required 
                            className={`form-input ${errors.destination ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        <div className="flex justify-between mt-1">
                            <small className="text-xs text-gray-500">{geocodingStatus.destination}</small>
                            {errors.destination && <small className="text-xs text-red-500">{errors.destination[0]}</small>}
                        </div>
                    </div>
                    
                    {/* Hidden Coordinate Inputs */}
                    <input type="hidden" name="origin_lat" value={formData.origin_lat} />
                    <input type="hidden" name="origin_lng" value={formData.origin_lng} />
                    <input type="hidden" name="dest_lat" value={formData.dest_lat} />
                    <input type="hidden" name="dest_lng" value={formData.dest_lng} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Departure Date</label>
                            <input 
                                type="date" 
                                name="departure_date" 
                                value={formData.departure_date} 
                                onChange={handleChange} 
                                required 
                                className={`form-input ${errors.departure_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.departure_date && <small className="text-xs text-red-500 mt-1 block">{errors.departure_date[0]}</small>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Departure Time</label>
                            <input 
                                type="time" 
                                name="departure_time" 
                                value={formData.departure_time} 
                                onChange={handleChange} 
                                required 
                                className={`form-input ${errors.departure_time ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                            />
                            {errors.departure_time && <small className="text-xs text-red-500 mt-1 block">{errors.departure_time[0]}</small>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Price per kg (₹)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            name="price_per_kg" 
                            value={formData.price_per_kg} 
                            onChange={handleChange} 
                            placeholder="Enter price (e.g. 15.50)"
                            required 
                            className={`form-input ${errors.price_per_kg ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        />
                        {errors.price_per_kg && <small className="text-xs text-red-500 mt-1 block">{errors.price_per_kg[0]}</small>}
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="btn-primary w-full sm:w-auto justify-center"
                        >
                            {isSubmitting ? 'Scheduling...' : 'Schedule Route'}
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

export default ScheduleRoutePage;
