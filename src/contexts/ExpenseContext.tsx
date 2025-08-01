import React, { createContext, useState, useContext, useMemo, ReactNode, useCallback } from 'react';
import {
    getCategories as apiGetCategories,
    createTransaction as apiCreateTransaction,
    getTransactions as apiGetTransactions,
    updateTransaction as apiUpdateTransaction,
    deleteTransaction as apiDeleteTransaction,
    getTransactionSummary as apiGetTransactionSummary
} from '../services/api';
import type { Category, Transaction, TransactionCreatePayload, UpdateTransactionPayload, TransactionSummaryResponse } from '../services/api.types';
import { useView } from './ViewContext'

// ✨ 1. 為讀取狀態建立一個更詳細的型別
interface LoadingState {
    categories: boolean;
    transactions: boolean;
    summary: boolean;
    mutating: boolean; // 用於新增、修改、刪除操作
}

interface ExpenseContextType {
    categories: Category[];
    transactions: Transaction[];
    summaryData: TransactionSummaryResponse | null;
    loading: LoadingState; // ✨ 2. 將 isLoading: boolean 換成 loading: LoadingState
    error: string | null;
    fetchCategories: () => Promise<void>;
    fetchTransactions: (year: number, month: number) => Promise<void>;
    fetchSummary: (year: number, month: number) => Promise<void>;
    addTransaction: (data: TransactionCreatePayload) => Promise<void>;
    editTransaction: (id: string, data: UpdateTransactionPayload) => Promise<void>;
    removeTransaction: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
    const { view } = useView()
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summaryData, setSummaryData] = useState<TransactionSummaryResponse | null>(null);
    // ✨ 3. 初始化更詳細的讀取狀態
    const [loading, setLoading] = useState<LoadingState>({
        categories: true, transactions: true, summary: true, mutating: false,
    });
    const [error, setError] = useState<string | null>(null);

    // ✨ 4. 每個函式現在只管理自己的讀取狀態
    const fetchCategories = useCallback(async () => {
        setLoading(prev => ({ ...prev, categories: true }));
        try {
            const fetchedCategories = await apiGetCategories();
            setCategories(fetchedCategories);
        } catch (err) {
            setError("Failed to load categories.");
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, categories: false }));
        }
    }, []);

    const fetchTransactions = useCallback(async (year: number, month: number) => {
        setLoading(prev => ({ ...prev, transactions: true }));
        try {
            const groupId = view.type === 'group' ? view.groupId : undefined;
            const fetchedTransactions = await apiGetTransactions(year, month, groupId);
            setTransactions(fetchedTransactions);
        } catch (err) {
            setError("Failed to load transactions.");
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, transactions: false }));
        }
    }, [view]);

    const fetchSummary = useCallback(async (year: number, month: number) => {
        setLoading(prev => ({ ...prev, summary: true }));
        try {
            const groupId = view.type === 'group' ? view.groupId : undefined;
            const data = await apiGetTransactionSummary(year, month, groupId);
            setSummaryData(data);
        } catch (err) {
            setError("Failed to load summary data.");
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, summary: false }));
        }
    }, [view]);

    const addTransaction = async (data: TransactionCreatePayload) => {
        setLoading(prev => ({ ...prev, mutating: true }));
        try {
            const newTransaction = await apiCreateTransaction(data);
            setTransactions(prev => [newTransaction, ...prev]);
        } catch (err) {
            setError("Failed to add transaction.");
            console.error(err);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, mutating: false }));
        }
    };

    const editTransaction = async (id: string, data: UpdateTransactionPayload) => {
        setLoading(prev => ({ ...prev, mutating: true }));
        try {
            const updatedTransaction = await apiUpdateTransaction(id, data);
            setTransactions(prev => prev.map(tx => (tx._id === id ? updatedTransaction : tx)));
        } catch (err) {
            setError("Failed to update transaction.");
            console.error(err);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, mutating: false }));
        }
    };

    const removeTransaction = async (id: string) => {
        setLoading(prev => ({ ...prev, mutating: true }));
        try {
            await apiDeleteTransaction(id);
            setTransactions(prev => prev.filter(tx => tx._id !== id));
        } catch (err) {
            setError("Failed to delete transaction.");
            console.error(err);
            throw err;
        } finally {
            setLoading(prev => ({ ...prev, mutating: false }));
        }
    };

    const value = useMemo(() => ({
        categories,
        transactions,
        summaryData,
        loading,
        error,
        fetchCategories,
        fetchTransactions,
        fetchSummary,
        addTransaction,
        editTransaction,
        removeTransaction,
    }), [categories, transactions, summaryData, loading, error, fetchCategories, fetchTransactions, fetchSummary]);

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (context === undefined) {
        throw new Error('useExpenses must be used within an ExpenseProvider');
    }
    return context;
};