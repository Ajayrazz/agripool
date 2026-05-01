import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Dashboard</h1>
            {user && (
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                    <h3>Welcome, {user.name}!</h3>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                </div>
            )}
            <button 
                onClick={logout} 
                style={{ padding: '10px 20px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
