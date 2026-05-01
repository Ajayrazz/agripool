import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({...formData, [e.target.name]: value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transporter/vehicles', formData);
            navigate('/transporter/fleet');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add vehicle');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Add Vehicle</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                    <label>Registration No:</label>
                    <input type="text" name="registration_no" value={formData.registration_no} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Model:</label>
                    <input type="text" name="model" value={formData.model} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Type:</label>
                    <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        <option value="truck">Truck</option>
                        <option value="mini-truck">Mini Truck</option>
                        <option value="pickup">Pickup</option>
                    </select>
                </div>
                <div>
                    <label>Total Capacity (kg):</label>
                    <input type="number" name="total_capacity_kg" step="0.1" value={formData.total_capacity_kg} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Add Vehicle</button>
            </form>
        </div>
    );
};

export default AddVehiclePage;
