import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

const MatchResultsPage = () => {
    const { id: requestId } = useParams();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (requestId) {
            fetchMatches();
        } else {
            setLoading(false);
        }
    }, [requestId]);

    const fetchMatches = async () => {
        try {
            const response = await api.get(`/matches?request_id=${requestId}`);
            setMatches(response.data.data);
        } catch (error) {
            console.error("Failed to fetch matches", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading matches...</div>;
    if (!requestId) return <div>No Request ID provided.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Available Transporters</h2>
                <Link to={`/farmer/requests/${requestId}`} style={{ textDecoration: 'none', color: '#007bff' }}>&larr; Back to Request Details</Link>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {matches.length === 0 ? (
                    <p>No matching transporters found for this route and date.</p>
                ) : (
                    matches.map(route => (
                        <div key={route.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>{route.vehicle?.user?.name} (Transporter)</h3>
                                <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#28a745' }}>
                                    ${route.price_per_kg} / kg
                                </span>
                            </div>
                            <p><strong>Vehicle:</strong> {route.vehicle?.model} ({route.vehicle?.vehicle_type})</p>
                            <p><strong>Remaining Capacity:</strong> {route.vehicle?.remaining_capacity_kg} kg</p>
                            <p><strong>Distance (Manhattan):</strong> {Number(route.distance).toFixed(4)} degrees</p>
                            <p><strong>Departure Time:</strong> {route.departure_time}</p>
                            
                            <div style={{ marginTop: '15px' }}>
                                <button style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                    Book this vehicle
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MatchResultsPage;
