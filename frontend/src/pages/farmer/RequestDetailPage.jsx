import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const RequestDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequest();
    }, [id]);

    const fetchRequest = async () => {
        try {
            const response = await api.get(`/requests/${id}`);
            setRequest(response.data);
        } catch (error) {
            console.error("Failed to fetch request", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this request?")) return;
        
        try {
            await api.delete(`/requests/${id}`);
            navigate('/farmer/requests');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel request');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!request) return <div>Request not found</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Request Details</h2>
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', marginTop: '20px' }}>
                <p><strong>Status:</strong> {request.status}</p>
                <p><strong>Pickup:</strong> {request.pickup_location}</p>
                <p><strong>Destination:</strong> {request.destination}</p>
                <p><strong>Produce:</strong> {request.produce_type}</p>
                <p><strong>Weight:</strong> {request.cargo_weight_kg} kg</p>
                <p><strong>Required Date:</strong> {request.required_date}</p>
                
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => navigate(`/farmer/requests/${id}/matches`)} style={{ padding: '8px 16px', background: '#17a2b8', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        View Matches
                    </button>
                    {request.status === 'open' && (
                        <button onClick={handleCancel} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                            Cancel Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestDetailPage;
