import React, { useEffect, useState } from 'react';
import api from '../../api';

const IncomingBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/transporter/bookings/incoming');
            setBookings(response.data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await api.patch(`/transporter/bookings/${id}/status`, { action });
            fetchBookings(); // Refresh the list
        } catch (error) {
            alert(error.response?.data?.message || `Failed to ${action} booking`);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Incoming Bookings</h2>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {bookings.length === 0 ? (
                    <p>No incoming bookings.</p>
                ) : (
                    bookings.map(booking => (
                        <div key={booking.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>Booking for Vehicle: {booking.vehicle?.registration_no}</h3>
                                <span style={{ padding: '5px 10px', background: booking.status === 'pending' ? '#ffc107' : (booking.status === 'confirmed' ? '#28a745' : '#dc3545'), color: '#fff', borderRadius: '15px', fontSize: '12px' }}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>
                            <p><strong>Farmer:</strong> {booking.farmer?.name} ({booking.farmer?.phone})</p>
                            <p><strong>Weight:</strong> {booking.booked_weight_kg} kg | <strong>Revenue:</strong> ${booking.total_cost}</p>
                            
                            {booking.status === 'pending' && (
                                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleAction(booking.id, 'accept')} style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                        Accept
                                    </button>
                                    <button onClick={() => handleAction(booking.id, 'reject')} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default IncomingBookingsPage;
