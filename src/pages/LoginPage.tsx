// src/pages/LoginPage.tsx

import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 為了視覺效果，我們可以在這個頁面也加上星空背景
const StarryBackground = () => (
  <>
    <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-gradient-to-b dark:from-[#0c0c1d] dark:to-[#111132] transition-colors duration-300 -z-20"></div>
    {/* 這裡可以選擇性地加入靜態的星空效果，但為了頁面簡潔，我們先只用背景色 */}
  </>
);


export const LoginPage = () => {
  // 從我們的 AuthContext 中取得需要的函式和狀態
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  // 使用 state 來管理表單輸入的內容
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 表單提交時的處理函式
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // 防止瀏覽器預設的表單提交流程

    try {
      // 呼叫 context 提供的 login 函式
      await login({ email, password });
      // 如果 login 函式成功執行（沒有拋出錯誤），則導覽到主頁
      navigate('/');
    } catch (err) {
      // 錯誤已經在 AuthContext 中被捕捉並設定到 error state
      // 所以這裡我們不需要做額外的事情
      console.error("Login attempt failed from page");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-transparent text-gray-900 dark:text-gray-200">
      <StarryBackground />
      <div className="w-full max-w-md p-8 space-y-8 bg-white/80 dark:bg-black/30 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Constellation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to continue
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 如果有錯誤訊息，就顯示在這裡 */}
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Not a member?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};