// src/contexts/GroupContext.tsx

import React, { createContext, useState, useContext, useMemo, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
    getMyGroups as apiGetMyGroups,
    createGroup as apiCreateGroup,
    addMemberToGroup as apiAddMember,
    removeMemberFromGroup as apiRemoveMember,
} from '../services/api';
import type { Group } from '../services/api.types';

interface GroupContextType {
    groups: Group[];
    isLoading: boolean;
    error: string | null;
    createGroup: (name: string) => Promise<void>;
    addMember: (groupId: string, email: string) => Promise<void>;
    removeMember: (groupId: string, memberId: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth(); // 依賴認證狀態
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedGroups = await apiGetMyGroups();
            setGroups(fetchedGroups);
        } catch (err) {
            setError("Failed to load groups.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 當使用者登入時，自動獲取他們的群組列表
    useEffect(() => {
        if (isAuthenticated) {
            fetchGroups();
        } else {
            // 如果使用者登出，清空群組資料
            setGroups([]);
        }
    }, [isAuthenticated, fetchGroups]);


    const createGroup = async (name: string) => {
        setIsLoading(true);
        try {
            const newGroup = await apiCreateGroup(name);
            setGroups(prev => [...prev, newGroup]);
        } catch (err) {
            setError("Failed to create group.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateGroupInState = (updatedGroup: Group) => {
        setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    };

    const addMember = async (groupId: string, email: string) => {
        setIsLoading(true);
        try {
            const updatedGroup = await apiAddMember(groupId, email);
            updateGroupInState(updatedGroup);
        } catch (err) {
            setError("Failed to add member.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const removeMember = async (groupId: string, memberId: string) => {
        setIsLoading(true);
        try {
            const updatedGroup = await apiRemoveMember(groupId, memberId);
            updateGroupInState(updatedGroup);
        } catch (err) {
            setError("Failed to remove member.");
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const value = useMemo(() => ({
        groups,
        isLoading,
        error,
        createGroup,
        addMember,
        removeMember,
    }), [groups, isLoading, error]);

    return (
        <GroupContext.Provider value={value}>
            {children}
        </GroupContext.Provider>
    );
};

export const useGroups = () => {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroups must be used within a GroupProvider');
    }
    return context;
};