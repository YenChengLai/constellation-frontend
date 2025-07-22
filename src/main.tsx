import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. 引入 AuthProvider
import { AuthProvider } from './contexts/AuthContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. 將 AuthProvider 放在最外層 */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);