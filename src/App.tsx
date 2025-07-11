import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { createBrowserRouter, RouterProvider, NavLink, Outlet } from 'react-router-dom';

// --- 1. 主題管理 (ThemeContext.tsx) ---
// 我們建立一個 Context 來全域管理淺色/深色模式的狀態。

type Theme = 'light' | 'dark';
type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // 優先從 localStorage 讀取使用者先前的選擇，若無則跟隨系統設定
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) return savedTheme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme 必須在 ThemeProvider 內使用');
    }
    return context;
};


// --- 2. 可重複使用的 UI 元件 (components) ---

// 主題切換按鈕 (ThemeToggle.tsx)
const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="切換主題"
        >
            {theme === 'light' ? (
                // 月亮圖示 (深色模式)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            ) : (
                // 太陽圖示 (淺色模式)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.05 14.95a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zm1.414-9.192a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414L6.464 6.464a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            )}
        </button>
    );
};


// --- 3. 頁面佈局 (layouts/MainLayout.tsx) ---
// 這是我們的「應用程式外殼」，包含了兩層側邊欄。

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-white dark:bg-[#111111] text-gray-800 dark:text-gray-300 transition-colors">
            {/* 主側邊欄 (Primary Sidebar) */}
            <aside className="w-20 bg-gray-100 dark:bg-black/30 border-r border-gray-200 dark:border-white/10 flex flex-col items-center py-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl mb-12 shadow-lg shadow-indigo-500/20">C</div>
                <nav className="flex flex-col items-center space-y-4">
                    <NavLink to="/" title="總覽" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </NavLink>
                    <NavLink to="/expenses" title="記帳系統" className={({ isActive }) => `p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </NavLink>
                </nav>
            </aside>

            {/* 主內容區，<Outlet /> 會根據路由渲染對應的頁面 */}
            <div className="flex-1 flex flex-col">
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// --- 4. 頁面元件 (pages) ---

// 歡迎頁面 (DashboardPage.tsx)
const DashboardPage = () => {
    return (
        <div className="p-8">
            <header className="h-20 flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">歡迎來到 Constellation</h1>
                <ThemeToggleButton />
            </header>
            <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Portal 框架</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    這是一個基礎的歡迎頁面。接下來，我們可以點擊左側的「記帳系統」圖示，
                    來查看帶有「子側邊欄」的複雜頁面佈局。
                </p>
            </div>
        </div>
    );
};

// 記帳系統的佈局和頁面 (ExpenseLayout.tsx, ExpenseDashboard.tsx)
const ExpenseLayout = () => {
    return (
        <div className="flex h-full">
            {/* 子側邊欄 (Secondary Sidebar) */}
            <aside className="w-64 bg-white dark:bg-black/10 border-r border-gray-200 dark:border-white/10 flex flex-col">
                <div className="p-6 h-20 flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">記帳系統</h2>
                </div>
                <nav className="flex-1 px-4 py-2 space-y-1">
                    <NavLink to="/expenses" end className={({ isActive }) => `block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-white bg-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>儀表板</NavLink>
                    <NavLink to="/expenses/transactions" className={({ isActive }) => `block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-white bg-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>交易紀錄</NavLink>
                    <NavLink to="/expenses/charts" className={({ isActive }) => `block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-white bg-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>圖表分析</NavLink>
                </nav>
            </aside>
            {/* 記帳系統的內容區 */}
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
};

const ExpenseDashboard = () => {
    return (
        <div className="p-8">
            <header className="h-20 flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">記帳儀表板</h1>
                <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-500 transition-colors">
                    新增一筆支出
                </button>
            </header>
            <div className="bg-gray-100 dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">內容區域</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">這裡將會顯示記帳系統的儀表板圖表與數據。</p>
            </div>
        </div>
    );
};

const TransactionsPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">交易紀錄</h1>
        </div>
    );
};

const ChartsPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">圖表分析</h1>
        </div>
    );
};


// --- 5. 路由設定 (App.tsx) ---
// 我們使用巢狀路由來實現我們的佈局。

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />, // MainLayout 是所有頁面的「外殼」
        children: [
            {
                index: true, // 預設路徑 (/)
                element: <DashboardPage />,
            },
            {
                path: "expenses",
                element: <ExpenseLayout />, // 記帳系統有自己的「子外殼」
                children: [
                    {
                        index: true, // 預設路徑 (/expenses)
                        element: <ExpenseDashboard />,
                    },
                    {
                        path: "transactions", // /expenses/transactions
                        element: <TransactionsPage />,
                    },
                    {
                        path: "charts", // /expenses/charts
                        element: <ChartsPage />,
                    },
                ],
            },
            // 未來可以新增更多應用程式的路由
            // { path: "fitness", element: <FitnessLayout /> ... }
        ],
    },
]);

function App() {
    return (
        <ThemeProvider>
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;