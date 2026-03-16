import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { API_ENDPOINTS } from '../config/api';

// Brain of authentication
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage (no token - it's in httpOnly cookie)
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return (storedUser && storedUser !== 'undefined') ? JSON.parse(storedUser) : null;
    });
    
    const [expiresAt, setExpiresAt] = useState(localStorage.getItem('expiresAt') || null);
    const [loading, setLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // Logout function: Clears all memory and calls backend to clear cookie
    const logout = useCallback(async () => {
        console.warn("Session ended. Clearing data and logging out...");
        
        setLogoutLoading(true);
        
        // Call backend to clear cookie
        try {
            await fetch(API_ENDPOINTS.logout, {
                method: 'POST',
                credentials: 'include' // Important: sends cookie
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Wait for minimum 2 seconds to show loader
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setUser(null);
        setExpiresAt(null);
        localStorage.removeItem('user');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('expiresAtReadable');
        localStorage.removeItem('token'); // Clean up old token if exists
        
        setLogoutLoading(false);
        // Navigation happens automatically via React Router when user becomes null
    }, []);

    // Auto-logout on token expiry on .env defined time
    useEffect(() => {
        if (!expiresAt) return;

        const checkExpiration = () => {
            const now = new Date().getTime();
            const expiry = new Date(expiresAt).getTime();
            
            if (now >= expiry) {
                console.warn("Token expired. Logging out...");
                logout();
            }
        };
        checkExpiration();
        const interval = setInterval(checkExpiration, 10000); // Check every 10 sec
        
        return () => clearInterval(interval);
    }, [expiresAt, logout]);

    // Verify token on mount - check if cookie still exists
    useEffect(() => {
        const verifySession = async () => {
            // Only verify if we have user data in localStorage
            if (!user) return;

            try {
                const response = await fetch(API_ENDPOINTS.verify, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    // Cookie is invalid or missing - logout
                    console.warn('Session invalid. Logging out...');
                    logout();
                }
            } catch (error) {
                console.error('Session verification failed:', error);
                logout();
            }
        };

        verifySession();
    }, []); // Only run on mount

    // Login function: Calls backend and saves the dynamic expiry time
    const login = async (employeeId, password) => {
        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ employeeId, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const readableExpiry = new Date(data.expiresAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });
 
                // Save to State
                setUser(data.user);
                setExpiresAt(data.expiresAt);
                
                // Save to LocalStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('expiresAt', data.expiresAt);
                localStorage.setItem('expiresAtReadable', readableExpiry);
                
                setLoading(false);
                return data;
            } else {
                setLoading(false);
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            setLoading(false);
            console.error('Login Error:', error.message);
            throw error;
        }
    };

    const value = {
        user,
        setUser,
        setExpiresAt,
        loading,
        logoutLoading,
        login,
        logout,
        // Check if user is Admin based on role or department
        isAdmin: user?.role === 'admin' || user?.department === 'Admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access to Auth
export const useAuth = () => useContext(AuthContext);