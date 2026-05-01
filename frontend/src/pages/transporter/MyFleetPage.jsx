import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const MyFleetPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await api.get('/transporter/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error("Failed to fetch vehicles", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this vehicle?")) return;
        try {
            await api.delete(`/transporter/vehicles/${id}`);
            fetchVehicles();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete vehicle');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>My Fleet</h2>
                <Link to="/transporter/fleet/new" style={{ padding: '8px 16px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>+ Add Vehicle</Link>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {vehicles.length === 0 ? (
                    <p>No vehicles in your fleet yet.</p>
                ) : (
                    vehicles.map(vehicle => (
                        <div key={vehicle.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>{vehicle.model} ({vehicle.registration_no})</h3>
                                <span style={{ padding: '5px 10px', background: vehicle.is_available ? '#28a745' : '#dc3545', color: '#fff', borderRadius: '15px', fontSize: '12px' }}>
                                    {vehicle.is_available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>
                            <p><strong>Type:</strong> {vehicle.vehicle_type}</p>
                            <p><strong>Capacity:</strong> {vehicle.total_capacity_kg} kg (Remaining: {vehicle.remaining_capacity_kg} kg)</p>
                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                <Link to={`/transporter/fleet/${vehicle.id}/routes/new`} style={{ color: '#007bff', textDecoration: 'none' }}>+ Schedule Route</Link>
                                <button onClick={() => handleDelete(vehicle.id)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyFleetPage;
