// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // 情況 1：正在從 localStorage 讀取 token，顯示載入中
    if (isLoading) {
        return <div>Loading session...</div>;
    }

    // 情況 2：驗證完畢，且使用者已登入，顯示該顯示的頁面
    if (isAuthenticated) {
        return <Outlet />; // Outlet 會渲染子路由的元件
    }

    // 情況 3：驗證完畢，但使用者未登入，重新導向到登入頁
    return <Navigate to="/login" />;
};