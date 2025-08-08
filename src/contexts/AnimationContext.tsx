import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';

interface AnimationContextType {
    isAnimationEnabled: boolean;
    toggleAnimation: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const AnimationProvider = ({ children }: { children: ReactNode }) => {
    const [isAnimationEnabled, setIsAnimationEnabled] = useState(() => JSON.parse(localStorage.getItem('animationEnabled') || 'true'));
    useEffect(() => {
        const root = document.documentElement;
        isAnimationEnabled ? root.classList.add('animations-enabled') : root.classList.remove('animations-enabled');
        localStorage.setItem('animationEnabled', JSON.stringify(isAnimationEnabled));
    }, [isAnimationEnabled]);
    const toggleAnimation = () => setIsAnimationEnabled(prev => !prev);
    const value = useMemo(() => ({ isAnimationEnabled, toggleAnimation }), [isAnimationEnabled]);
    return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
};

export const useAnimation = () => {
    const context = useContext(AnimationContext);
    if (!context) throw new Error('useAnimation must be used within an AnimationProvider');
    return context;
};