import React, { useState, useEffect, createContext, useContext, useMemo, useRef, RefObject } from 'react';
import { createBrowserRouter, RouterProvider, NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
// 從獨立檔案中引入 Contexts 和 Hooks
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useAnimation } from './contexts/AnimationContext';
import { useBackgroundEffect } from './contexts/BackgroundEffectContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { GroupProvider } from './contexts/GroupContext';
import { ViewProvider } from './contexts/ViewContext';

// 引入頁面和元件
import { ExpenseDashboardPage } from './pages/ExpenseDashboardPage';
import { ExpenseCalendarPage } from './pages/ExpenseCalendarPage';
import { LoginPage } from './pages/LoginPage';
import { TransactionPage } from './pages/TransactionPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignupPage } from './pages/SignupPage';
import { ErrorPage } from './pages/ErrorPage';
import { PendingVerificationPage } from './pages/PendingVerificationPage';

import { ViewSwitcher } from './components/ViewSwitcher';
import { CategoryManagementPage } from './pages/CategoryManagementPage';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountManagementPage } from './pages/AccountManagementPage';

// --- Custom Hook ---
function useClickOutside<T extends HTMLElement = HTMLElement>(handler: (event: MouseEvent | TouchEvent) => void): RefObject<T> { /* ... */ }


// --- 2. UI (Components) ---
const StarryBackground = () => {
    const { isBackgroundEnabled } = useBackgroundEffect();
    const shadowsSmall = useMemo(() => Array.from({ length: 700 }, () => `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`).join(','), []);
    const shadowsMedium = useMemo(() => Array.from({ length: 200 }, () => `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`).join(','), []);
    const shadowsBig = useMemo(() => Array.from({ length: 100 }, () => `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF`).join(','), []);

    if (!isBackgroundEnabled) {
        return <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-[#0c0c1d] transition-colors duration-300 -z-20"></div>;
    }

    return (
        <>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-100 to-sky-200 dark:bg-gradient-to-b dark:from-[#0c0c1d] dark:to-[#111132] transition-colors duration-300 -z-20"></div>
            <div id="stars-container" className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div id="stars" style={{ boxShadow: shadowsSmall }}></div>
                <div id="stars2" style={{ boxShadow: shadowsMedium }}></div>
                <div id="stars3" style={{ boxShadow: shadowsBig }}></div>
            </div>
            <style>{`
                #stars-container { opacity: 0; transition: opacity 0.8s ease-in-out; }
                .dark #stars-container { opacity: 1; }
                .light #stars-container { opacity: 0.6; }
                @keyframes animStar { from { transform: translateY(0px); } to { transform: translateY(-2000px); } }
                
                #stars, #stars2, #stars3 {
                    position: absolute;
                    top: 0;
                    left: 0;
                    background: transparent;
                }
                
                #stars { width: 1px; height: 1px; }
                #stars2 { width: 2px; height: 2px; }
                #stars3 { width: 3px; height: 3px; }

                .animations-enabled #stars { animation: animStar 150s linear infinite; }
                .animations-enabled #stars2 { animation: animStar 100s linear infinite; }
                .animations-enabled #stars3 { animation: animStar 50s linear infinite; }
            `}</style>
        </>
    );
};
const ThemeToggleButton = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors" aria-label="切換主題">
            {theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM5.05 14.95a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zm1.414-9.192a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414L6.464 6.464a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
        </button>
    );
};
const AnimationToggleButton = () => {
    const { isAnimationEnabled, toggleAnimation } = useAnimation();
    return (
        <button onClick={toggleAnimation} className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors" aria-label="切換動畫效果">
            {isAnimationEnabled ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3.09 3.09m0 0a2.5 2.5 0 103.536 3.536M15 5l3.09 3.09m-3.09-3.09a2.5 2.5 0 11-3.536 3.536M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>)}
        </button>
    );
};
const BackgroundToggleButton = () => {
    const { isBackgroundEnabled, toggleBackground } = useBackgroundEffect();
    return (
        <button onClick={toggleBackground} className="p-2 rounded-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors" aria-label="切換背景特效">
            {isBackgroundEnabled ? (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>)}
        </button>
    );
};
type SubNavItemConfig = { name: string; path: string; children?: { name: string; path: string; }[]; }
const CollapsibleMenuItem = ({ item }: { item: SubNavItemConfig }) => {
    const location = useLocation();
    const isParentActive = item.children?.some(child => location.pathname.startsWith(child.path));
    const [isOpen, setIsOpen] = useState(isParentActive || false);
    useEffect(() => { setIsOpen(isParentActive || false); }, [isParentActive, location.pathname]);
    if (!item.children) return <NavLink to={item.path} className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10">{item.name}</NavLink>;
    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors">
                <span>{item.name}</span><svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
            {isOpen && <div className="mt-1 pl-4 border-l border-gray-200 dark:border-gray-700 ml-2">{item.children.map(child => <NavLink key={child.name} to={child.path} className="flex items-center my-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10">{child.name}</NavLink>)}</div>}
        </div>
    );
};

// --- 3. 佈局與頁面 (Layouts & Pages) ---
type NavItemConfig = { name: string; path: string; icon: React.ReactNode; children?: SubNavItemConfig[]; };
const navConfig: NavItemConfig[] = [
    { name: '儀表板', path: '/', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { name: '記帳系統', path: '/expenses', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>, children: [{ name: '儀表板', path: '/expenses' }, { name: '帳號管理', path: '/expenses/accounts' }, { name: '交易紀錄', path: '/expenses/transactions' }, { name: '分類管理', path: '/expenses/categories' }, { name: '日曆檢視', path: '/expenses/calendar' }] },
    { name: '健身紀錄', path: '/fitness', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>, children: [{ name: '訓練日誌', path: '/fitness' }, { name: '動作庫', path: '/fitness/exercises' },] },
];
const userNavConfig: NavItemConfig[] = [
    { name: '設定', path: '/settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

const MainLayout = () => {
    const { user, logout } = useAuth();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const location = useLocation();
    const navigate = useNavigate();
    const activeSubMenuConfig = useMemo(() => navConfig.find(item => item.children && location.pathname.startsWith(item.path)), [location.pathname]);
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(!!activeSubMenuConfig);
    const subMenuRef = useClickOutside<HTMLElement>(() => {
        if (activeSubMenuConfig) { setIsSubMenuOpen(false); }
    });
    useEffect(() => {
        if (activeSubMenuConfig) setIsSubMenuOpen(true);
    }, [activeSubMenuConfig]);
    const handleMainMenuClick = (item: NavItemConfig) => {
        const isModuleAlreadyActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
        const canToggle = !!item.children;
        if (isModuleAlreadyActive && canToggle) { setIsSubMenuOpen(prev => !prev); } else { navigate(item.path); }
    };
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    return (
        <div className="relative flex h-screen bg-transparent text-gray-900 dark:text-gray-200">
            <StarryBackground />
            <aside className="w-20 flex-shrink-0 bg-gray-100/80 dark:bg-black/30 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col items-center justify-between py-6 z-20">
                <div>
                    <button onClick={() => navigate('/')} className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl mb-12 shadow-lg shadow-indigo-500/20">C</button>
                    <nav className="flex flex-col items-center space-y-4">
                        {navConfig.map(item => {
                            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                            return (<button key={item.name} title={item.name} onClick={() => handleMainMenuClick(item)} className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}>{item.icon}</button>);
                        })}
                    </nav>
                </div>
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-8 h-px bg-gray-300 dark:bg-gray-700 my-2"></div>
                    {userNavConfig.map(item => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (<button key={item.name} onClick={() => handleMainMenuClick(item)} title={item.name} className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}>{item.icon}</button>);
                    })}
                    <button title="使用者名稱" className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold">YC</button>
                    {user?.email === adminEmail && (
                        <Link to="/admin/users" title="管理" className="p-3 rounded-xl transition-colors text-gray-500 hover:bg-yellow-500/20 hover:text-yellow-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </Link>
                    )}
                    <button onClick={handleLogout} title="登出" className="p-3 rounded-xl transition-colors text-gray-500 hover:bg-red-500/20 hover:text-red-400 dark:hover:bg-red-500/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex overflow-x-hidden">
                {activeSubMenuConfig && (
                    <aside ref={subMenuRef} className={`w-64 flex-shrink-0 bg-gray-50/90 dark:bg-[#111111]/90 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col transition-margin duration-300 ease-in-out ${isSubMenuOpen ? 'ml-0' : '-ml-64'}`}>
                        {activeSubMenuConfig.path === '/expenses' && <ViewSwitcher />}
                        <div className="p-6 h-20 flex-shrink-0 flex items-center"><h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{activeSubMenuConfig.name}</h2></div>
                        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">{activeSubMenuConfig.children?.map(child => <CollapsibleMenuItem key={child.name} item={child} />)}</nav>
                    </aside>
                )}
                <main className="flex-1 flex flex-col overflow-y-auto"><div className="flex-1 p-8"><Outlet /></div></main>
            </div>
        </div>
    );
};

const WelcomePage = () => (
    <>
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">歡迎來到 Constellation 儀表板</h1>
            <div className="flex items-center space-x-2">
                <BackgroundToggleButton />
                <AnimationToggleButton />
                <ThemeToggleButton />
            </div>
        </header>
        <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-gray-200 dark:border-white/10"><h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">探索你的宇宙</h3><p className="text-gray-600 dark:text-gray-300 mt-2">這裡是您所有生活模組的資訊中心，點擊左側圖示開始探索。</p></div>
    </>
);
const GenericPage = ({ title }: { title: string }) => (
    <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex items-center space-x-2">
            <BackgroundToggleButton />
            <AnimationToggleButton />
            <ThemeToggleButton />
        </div>
    </header>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRoute />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: (
                    <ViewProvider>
                        <GroupProvider>
                            <ExpenseProvider>
                                <MainLayout />
                            </ExpenseProvider>
                        </GroupProvider>
                    </ViewProvider>
                ),
                children: [
                    { index: true, element: <WelcomePage /> },
                    { path: "expenses", element: <ExpenseDashboardPage /> },
                    { path: "expenses/accounts", element: <AccountManagementPage /> },
                    { path: "expenses/transactions", element: <TransactionPage /> },
                    { path: "expenses/categories", element: <CategoryManagementPage /> },
                    { path: "expenses/calendar", element: <ExpenseCalendarPage /> },
                    { path: "fitness", element: <GenericPage title="訓練日誌" /> },
                    { path: "fitness/exercises", element: <GenericPage title="動作庫" /> },
                    { path: "settings", element: <SettingsPage /> },
                ]
            }
        ]
    },
    {
        path: "/admin",
        element: <AdminProtectedRoute />,
        errorElement: <ErrorPage />, // Admin 區也可以有自己的錯誤頁
        children: [
            {
                // 因為 MainLayout 已經被 ExpenseProvider 包裹，
                // 為了讓 AdminPage 不受影響，我們在這裡也需要 MainLayout 但不帶 ExpenseProvider
                path: "users",
                element: <MainLayout />,
                children: [
                    { index: true, element: <AdminPage /> }
                ]
            }
        ]
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/signup",
        element: <SignupPage />,
    },
    {
        path: "/pending-verification",
        element: <PendingVerificationPage />,
    }
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;