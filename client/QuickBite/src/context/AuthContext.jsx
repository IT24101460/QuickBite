import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveToken, saveUser, clearAuth, getToken, getUser } from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore session on app start
        (async () => {
            const storedToken = await getToken();
            const storedUser = await getUser();
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(storedUser);
            }
            setLoading(false);
        })();
    }, []);

    const login = async (newToken, userData) => {
        await saveToken(newToken);
        await saveUser(userData);
        setToken(newToken);
        setUser(userData);
    };

    const logout = async () => {
        await clearAuth();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin: user?.isAdmin || false, role: user?.role || 'user' }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
