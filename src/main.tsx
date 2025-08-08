import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AnimationProvider } from './contexts/AnimationContext.tsx';
import { BackgroundEffectProvider } from './contexts/BackgroundEffectContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BackgroundEffectProvider>
        <AnimationProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AnimationProvider>
      </BackgroundEffectProvider>
    </AuthProvider>
  </React.StrictMode>,
);