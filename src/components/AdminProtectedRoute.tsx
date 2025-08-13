// src/components/AdminProtectedRoute.tsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminProtectedRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    // 檢查環境變數 VITE_ADMIN_EMAIL 是否被定義
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    if (!adminEmail) {
        console.error("VITE_ADMIN_EMAIL is not defined in .env.local");
        return <Navigate to="/" />; // 如果沒有定義 ADMIN_EMAIL，則直接導回首頁
    }

    // 如果還在從 localStorage 讀取登入狀態，顯示載入中
    if (isLoading) {
        return <div>Loading session...</div>;
    }

    // 如果已登入且 email 與 ADMIN_EMAIL 相符，則顯示子頁面
    if (isAuthenticated && user?.email === adminEmail) {
        return <Outlet />;
    }

    // 如果未登入或不是管理員，則導向回首頁
    return <Navigate to="/" />;
};