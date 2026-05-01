import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const ScheduleRoutePage = () => {
    const { vehicleId } = useParams();
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        origin_lat: 0,
        origin_lng: 0,
        dest_lat: 0,
        dest_lng: 0,
        departure_date: '',
        departure_time: '',
        price_per_kg: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/transporter/vehicles/${vehicleId}/routes`, formData);
            navigate('/transporter/fleet');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to schedule route');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Schedule Route</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Origin:</label>
                    <input type="text" name="origin" value={formData.origin} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Destination:</label>
                    <input type="text" name="destination" value={formData.destination} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Departure Date:</label>
                    <input type="date" name="departure_date" value={formData.departure_date} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Departure Time:</label>
                    <input type="time" name="departure_time" value={formData.departure_time} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Price per kg ($):</label>
                    <input type="number" step="0.01" name="price_per_kg" value={formData.price_per_kg} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Schedule Route</button>
            </form>
        </div>
    );
};

export default ScheduleRoutePage;
