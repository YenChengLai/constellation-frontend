// src/contexts/ViewContext.tsx

import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';

// 定義「視角」的型別
export type View = { type: 'personal' } | { type: 'group'; groupId: string; groupName: string };

interface ViewContextType {
    view: View;
    setView: (view: View) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

// 預設的個人視角
const defaultView: View = { type: 'personal' };

export const ViewProvider = ({ children }: { children: ReactNode }) => {
    const [view, setView] = useState<View>(() => {
        // 嘗試從 sessionStorage 讀取上次的視角，如果沒有則預設為個人
        const savedView = sessionStorage.getItem('currentView');
        return savedView ? JSON.parse(savedView) : defaultView;
    });

    const handleSetView = (newView: View) => {
        setView(newView);
        sessionStorage.setItem('currentView', JSON.stringify(newView));
    };

    const value = useMemo(() => ({
        view,
        setView: handleSetView,
    }), [view]);

    return (
        <ViewContext.Provider value={value}>
            {children}
        </ViewContext.Provider>
    );
};

export const useView = () => {
    const context = useContext(ViewContext);
    if (context === undefined) {
        throw new Error('useView must be used within a ViewProvider');
    }
    return context;
};