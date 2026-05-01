import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const MyRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/requests');
            setRequests(response.data.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>My Transport Requests</h2>
                <Link to="/farmer/requests/new" style={{ padding: '8px 16px', background: '#007bff', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>+ New Request</Link>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {requests.length === 0 ? (
                    <p>No requests found.</p>
                ) : (
                    requests.map(req => (
                        <div key={req.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>{req.pickup_location} ➔ {req.destination}</h3>
                                <span style={{ padding: '5px 10px', background: req.status === 'open' ? '#ffc107' : '#28a745', color: '#fff', borderRadius: '15px', fontSize: '12px' }}>
                                    {req.status.toUpperCase()}
                                </span>
                            </div>
                            <p><strong>Produce:</strong> {req.produce_type} | <strong>Weight:</strong> {req.cargo_weight_kg}kg</p>
                            <p><strong>Required By:</strong> {req.required_date}</p>
                            <Link to={`/farmer/requests/${req.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>View Details</Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyRequestsPage;
