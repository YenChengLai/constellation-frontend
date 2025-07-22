import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout } from '../services/api';
import type { LoginCredentials } from '../services/api';

// Define the structure of user information decoded from the JWT token
interface DecodedUser {
    sub: string; // "subject", typically the user_id
    email: string;
}

// Define the type for the value that AuthContext will provide
interface AuthContextType {
    isAuthenticated: boolean;
    user: DecodedUser | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>; // Logout is now async
}

// Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<DecodedUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // On initial app load, check localStorage for an existing session
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('accessToken');
            if (storedToken) {
                const decodedUser: DecodedUser = jwtDecode(storedToken);
                setAccessToken(storedToken);
                setUser(decodedUser);
            }
        } catch (e) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Login function
    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiLogin(credentials);
            const { access_token, refresh_token } = data;

            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);

            const decodedUser: DecodedUser = jwtDecode(access_token);
            setAccessToken(access_token);
            setUser(decodedUser);

        } catch (err: any) {
            if (err.response && err.response.status === 403) {
                setError(err.response.data.detail || 'Account not verified.');
            } else {
                setError('Login failed. Please check your email or password.');
            }
            console.error(err);
            // Rethrow the error to allow the caller to handle it
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // logout function
    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            // Notify the backend to invalidate the token, even if it fails, the frontend will still log out
            await apiLogout(refreshToken);
        }

        setUser(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    const value = useMemo(() => ({
        isAuthenticated: !!accessToken,
        user,
        isLoading,
        error,
        login,
        logout,
    }), [accessToken, user, isLoading, error]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy context consumption
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};