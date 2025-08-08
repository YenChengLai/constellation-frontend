import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';

interface BackgroundEffectContextType {
    isBackgroundEnabled: boolean;
    toggleBackground: () => void;
}

const BackgroundEffectContext = createContext<BackgroundEffectContextType | undefined>(undefined);

export const BackgroundEffectProvider = ({ children }: { children: ReactNode }) => {
    const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(() => JSON.parse(localStorage.getItem('backgroundEnabled') || 'true'));
    useEffect(() => {
        localStorage.setItem('backgroundEnabled', JSON.stringify(isBackgroundEnabled));
    }, [isBackgroundEnabled]);
    const toggleBackground = () => setIsBackgroundEnabled(prev => !prev);
    const value = useMemo(() => ({ isBackgroundEnabled, toggleBackground }), [isBackgroundEnabled]);
    return <BackgroundEffectContext.Provider value={value}>{children}</BackgroundEffectContext.Provider>;
};

export const useBackgroundEffect = () => {
    const context = useContext(BackgroundEffectContext);
    if (!context) throw new Error('useBackgroundEffect must be used within a BackgroundEffectProvider');
    return context;
};