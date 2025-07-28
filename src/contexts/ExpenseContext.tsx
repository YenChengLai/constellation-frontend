// src/contexts/ExpenseContext.tsx

import React, { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react';
import {
    getCategories as apiGetCategories,
    createTransaction as apiCreateTransaction,
    getTransactions as apiGetTransactions,
    updateTransaction as apiUpdateTransaction,
    deleteTransaction as apiDeleteTransaction
} from '../services/api';
import type { Category, Transaction, TransactionCreatePayload, UpdateTransactionPayload } from '../services/api.types';

// 定義 ExpenseContext 要提供的值的型別
interface ExpenseContextType {
    categories: Category[];
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
    fetchTransactions: () => Promise<void>;
    addTransaction: (data: TransactionCreatePayload) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
}

// 建立 Context
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// 建立 Provider 元件
export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 獲取分類的函式
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedCategories = await apiGetCategories();
            setCategories(fetchedCategories);
        } catch (err) {
            setError("Failed to load categories.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedTransactions = await apiGetTransactions();
            setTransactions(fetchedTransactions);
        } catch (err) {
            setError("Failed to load transactions.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 新增一筆交易的函式
    const addTransaction = async (data: TransactionCreatePayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const newTransaction = await apiCreateTransaction(data);
            // 成功後，將新交易加到現有的 state 中
            setTransactions(prev => [newTransaction, ...prev]);
        } catch (err) {
            setError("Failed to add transaction.");
            console.error(err);
            // 重新拋出錯誤，讓呼叫它的 UI 元件也能知道失敗了
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const editTransaction = async (id: string, data: UpdateTransactionPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedTransaction = await apiUpdateTransaction(id, data);
            // 更新本地狀態陣列中對應的項目
            setTransactions(prev => prev.map(tx => (tx.id === id ? updatedTransaction : tx)));
        } catch (err) {
            setError("Failed to update transaction.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const removeTransaction = async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiDeleteTransaction(id);
            // 從本地狀態陣列中移除該項目
            setTransactions(prev => prev.filter(tx => tx.id !== id));
        } catch (err) {
            setError("Failed to delete transaction.");
            console.error(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const value = useMemo(() => ({
        categories,
        transactions,
        isLoading,
        error,
        fetchCategories,
        fetchTransactions,
        addTransaction,
        editTransaction,
        removeTransaction
    }), [categories, transactions, isLoading, error, fetchCategories, fetchTransactions]);

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};

// 建立一個 custom hook，讓子元件可以輕鬆地使用 context
export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
};