import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/employees/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUser({
                    ...data.user,
                    profile: data.profile,
                    skills: data.skills
                });
            } else {
                // If token is invalid or profile not found
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, fetchProfile, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
