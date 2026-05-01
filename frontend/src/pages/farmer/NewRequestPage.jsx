import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const NewRequestPage = () => {
    const [formData, setFormData] = useState({
        pickup_location: '',
        destination: '',
        pickup_lat: 0,
        pickup_lng: 0,
        cargo_weight_kg: '',
        produce_type: '',
        required_date: ''
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests', formData);
            navigate('/farmer/requests');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create request');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Create Transport Request</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Pickup Location:</label>
                    <input type="text" name="pickup_location" value={formData.pickup_location} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Destination:</label>
                    <input type="text" name="destination" value={formData.destination} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Cargo Weight (kg):</label>
                    <input type="number" name="cargo_weight_kg" value={formData.cargo_weight_kg} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Produce Type:</label>
                    <input type="text" name="produce_type" value={formData.produce_type} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Required Date:</label>
                    <input type="date" name="required_date" value={formData.required_date} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Submit Request</button>
            </form>
        </div>
    );
};

export default NewRequestPage;
