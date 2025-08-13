// src/pages/AdminPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { getUnverifiedUsers, verifyUser } from '../services/api';
import type { UserForAdmin } from '../services/api.types';

export const AdminPage = () => {
    const [users, setUsers] = useState<UserForAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const unverifiedUsers = await getUnverifiedUsers();
            setUsers(unverifiedUsers);
        } catch (err) {
            setError("無法載入使用者列表");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleVerify = async (userId: string) => {
        try {
            await verifyUser(userId);
            // 成功後，將該使用者從列表中移除，達到即時更新的效果
            setUsers(prevUsers => prevUsers.filter(u => u.user_id !== userId));
        } catch (err) {
            alert("驗證失敗，請重試");
        }
    };

    return (
        <div className="container mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">使用者驗證管理</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">以下是所有等待驗證的新註冊帳號。</p>
            </header>

            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
                {isLoading ? (
                    <p>載入中...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : users.length === 0 ? (
                    <p>目前沒有等待驗證的使用者。</p>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map(user => (
                            <li key={user.user_id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        註冊於：{new Date(user.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleVerify(user.user_id)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                                >
                                    核准
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};