import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Schedule Route</h2>
            {globalError && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>{globalError}</div>}
            {successMsg && <div style={{ color: 'green', marginBottom: '10px', padding: '10px', background: '#e6ffe6', borderRadius: '4px' }}>{successMsg}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Origin:</label>
                    <input 
                        type="text" 
                        name="origin" 
                        value={formData.origin} 
                        onChange={handleChange} 
                        onBlur={(e) => handleGeocode('origin', e.target.value)}
                        required 
                        style={{ width: '100%', padding: '8px', borderColor: errors.origin ? 'red' : '#ccc' }} 
                    />
                    <small style={{ color: 'grey', display: 'block', marginTop: '4px' }}>{geocodingStatus.origin}</small>
                    {errors.origin && <small style={{ color: 'red' }}>{errors.origin[0]}</small>}
                </div>
                <div>
                    <label>Destination:</label>
                    <input 
                        type="text" 
                        name="destination" 
                        value={formData.destination} 
                        onChange={handleChange} 
                        onBlur={(e) => handleGeocode('destination', e.target.value)}
                        required 
                        style={{ width: '100%', padding: '8px', borderColor: errors.destination ? 'red' : '#ccc' }} 
                    />
                    <small style={{ color: 'grey', display: 'block', marginTop: '4px' }}>{geocodingStatus.destination}</small>
                    {errors.destination && <small style={{ color: 'red' }}>{errors.destination[0]}</small>}
                </div>
                
                {/* Hidden Coordinate Inputs */}
                <input type="hidden" name="origin_lat" value={formData.origin_lat} />
                <input type="hidden" name="origin_lng" value={formData.origin_lng} />
                <input type="hidden" name="dest_lat" value={formData.dest_lat} />
                <input type="hidden" name="dest_lng" value={formData.dest_lng} />

                <div>
                    <label>Departure Date:</label>
                    <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} required style={{ width: '100%', padding: '8px', borderColor: errors.departure_date ? 'red' : '#ccc' }} />
                    {errors.departure_date && <small style={{ color: 'red', display: 'block' }}>{errors.departure_date[0]}</small>}
                </div>
                <div>
                    <label>Departure Time:</label>
                    <input type="time" name="departure_time" value={formData.departure_time} onChange={handleChange} required style={{ width: '100%', padding: '8px', borderColor: errors.departure_time ? 'red' : '#ccc' }} />
                    {errors.departure_time && <small style={{ color: 'red', display: 'block' }}>{errors.departure_time[0]}</small>}
                </div>
                <div>
                    <label>Price per kg ($):</label>
                    <input type="number" step="0.01" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} required style={{ width: '100%', padding: '8px', borderColor: errors.price_per_kg ? 'red' : '#ccc' }} />
                    {errors.price_per_kg && <small style={{ color: 'red', display: 'block' }}>{errors.price_per_kg[0]}</small>}
                </div>
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Schedule Route</button>
            </form>
        </div>
    );
};

export default ScheduleRoutePage;
