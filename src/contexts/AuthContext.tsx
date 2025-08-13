import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMyProfile as apiGetMyProfile } from '../services/api';
import type { LoginCredentials, UserPublic } from '../services/api';


// Define the type for the value that AuthContext will provide
interface AuthContextType {
    isAuthenticated: boolean;
    user: UserPublic | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

// Create the Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserPublic | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAndSetUser = useCallback(async () => {
        try {
            const profile = await apiGetMyProfile();
            setUser(profile);
        } catch (e) {
            setUser(null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }, []);

    // On initial app load, check localStorage for an existing session
    useEffect(() => {
        const checkUserSession = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await fetchAndSetUser();
            }
            setIsLoading(false);
        };
        checkUserSession();
    }, [fetchAndSetUser]);

    // Login function
    const login = async (credentials: LoginCredentials) => {
        setIsLoading(true);
        setError(null);
        try {
            const { access_token, refresh_token } = await apiLogin(credentials);
            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);

            // 登入成功後，立刻獲取完整的個人資料，而不是自己解碼
            await fetchAndSetUser();
        } catch (err: any) {
            setError(err.response?.data?.detail || '登入失敗，請檢查您的帳號或密碼。');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // logout function
    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await apiLogout(refreshToken);
            } catch (error) {
                console.error("Logout API call failed, clearing session anyway.", error);
            }
        }
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    const refreshUser = async () => {
        setIsLoading(true);
        await fetchAndSetUser();
        setIsLoading(false);
    };

    const value = useMemo(() => ({
        isAuthenticated: !!user,
        user,
        isLoading,
        error,
        login,
        logout,
        refreshUser,
    }), [user, isLoading, error]);

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