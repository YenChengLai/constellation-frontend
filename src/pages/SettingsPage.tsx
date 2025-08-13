import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateMyProfile, changePassword } from '../services/api';
import type { UserUpdatePayload, ChangePasswordPayload, UserPublic } from '../services/api.types';

// --- 個人資料設定元件 ---
const ProfileSettings = () => {
    const { user, refreshUser } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');

        const payload: UserUpdatePayload = { first_name: firstName, last_name: lastName };

        try {
            await updateMyProfile(payload);
            setSuccessMessage("個人資料更新成功！");
            if (refreshUser) await refreshUser();
        } catch (error) {
            setSuccessMessage("更新失敗，請稍後再試。");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">個人資料</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                    <input type="email" disabled value={user?.email || ''} className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md opacity-60 cursor-not-allowed" />
                </div>
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">名字</label>
                    <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">姓氏</label>
                    <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div className="flex justify-end items-center pt-2">
                    {successMessage && <p className="text-sm text-green-500 mr-4">{successMessage}</p>}
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSaving ? '儲存中...' : '儲存變更'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- 密碼安全設定元件 ---
const PasswordSettings = () => {
    const { logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (newPassword !== confirmPassword) { setError("新密碼與確認密碼不符"); return; }
        if (newPassword.length < 8) { setError("新密碼長度不可小於 8 個字元"); return; }

        setIsSaving(true);
        const payload: ChangePasswordPayload = { current_password: currentPassword, new_password: newPassword };

        try {
            await changePassword(payload);
            setSuccessMessage("密碼更新成功！您將被登出，請用新密碼重新登入。");
            setTimeout(async () => {
                await logout();
                window.location.href = '/login';
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || "密碼變更失敗");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">密碼安全</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">目前密碼</label>
                    <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">新密碼</label>
                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">確認新密碼</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div className="flex justify-end items-center pt-2">
                    {error && <p className="text-sm text-red-500 mr-4">{error}</p>}
                    {successMessage && <p className="text-sm text-green-500 mr-4">{successMessage}</p>}
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                        {isSaving ? '變更中...' : '變更密碼'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- 主要的設定頁面 ---
export const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

    const getTabClassName = (tabName: 'profile' | 'password') => {
        const isActive = activeTab === tabName;
        return `group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer text-left ${isActive
            ? 'bg-gray-200 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`;
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">設定</h1>

            {/* ✨ 1. 使用 Grid 佈局建立兩欄式結構 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* ✨ 2. 左側導覽欄 */}
                <div className="md:col-span-1">
                    <nav className="space-y-1">
                        <button onClick={() => setActiveTab('profile')} className={getTabClassName('profile')}>
                            個人資料
                        </button>
                        <button onClick={() => setActiveTab('password')} className={getTabClassName('password')}>
                            密碼安全
                        </button>
                    </nav>
                </div>

                {/* ✨ 3. 右側內容面板 */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && <ProfileSettings />}
                    {activeTab === 'password' && <PasswordSettings />}
                </div>
            </div>
        </div>
    );
};