import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.get('/me')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    logout();
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (credentials) => {
        const response = await api.post('/login', credentials);
        const { access_token, user } = response.data;
        localStorage.setItem('auth_token', access_token);
        setToken(access_token);
        setUser(user);
        return user;
    };

    const register = async (userData) => {
        const response = await api.post('/register', userData);
        const { access_token, user } = response.data;
        localStorage.setItem('auth_token', access_token);
        setToken(access_token);
        setUser(user);
        return user;
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/logout');
            }
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
