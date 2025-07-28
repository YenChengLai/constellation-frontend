import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import type { Category, Transaction, TransactionCreatePayload, UpdateTransactionPayload } from '../services/api.types';
import { useAuth } from '../contexts/AuthContext';

// --- 新增/編輯交易的彈出視窗 (Modal) 元件 ---
const TransactionModal = ({ isOpen, onClose, transactionToEdit }: {
    isOpen: boolean,
    onClose: () => void,
    transactionToEdit: Transaction | null
}) => {
    const { addTransaction, editTransaction, categories, isLoading: isContextLoading } = useExpenses();
    const { error: contextError } = useAuth();

    const isEditMode = !!transactionToEdit;

    // 表單狀態
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
    const [description, setDescription] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const resetForm = () => {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setTransactionDate(new Date().toISOString().slice(0, 10));
        setDescription('');
        setLocalError(null);
    };

    const handleClose = () => {
        onClose();
    };

    // 當 transactionToEdit 變化時 (例如點擊編輯按鈕)，用它的資料填充表單
    useEffect(() => {
        // 只在 Modal 打開時作用
        if (isOpen) {
            if (isEditMode && transactionToEdit) {
                // 如果是編輯模式，用傳入的資料填充表單
                setType(transactionToEdit.type);
                setAmount(String(transactionToEdit.amount));
                setCategoryId(transactionToEdit.category._id); // 使用 _id
                setTransactionDate(new Date(transactionToEdit.transaction_date).toISOString().slice(0, 10));
                setDescription(transactionToEdit.description || '');
            } else {
                // 如果是新增模式，重設表單
                resetForm();
            }
        }
    }, [isOpen, isEditMode, transactionToEdit]);

    // 當交易類型改變時，清空已選擇的分類
    useEffect(() => {
        if (!isEditMode) { // 只在新增模式下自動清空
            setCategoryId('');
        }
    }, [type, isEditMode]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (!categoryId) {
            setLocalError('請選擇一個分類');
            return;
        }
        if (parseFloat(amount) <= 0 || isNaN(parseFloat(amount))) {
            setLocalError('金額必須是正數');
            return;
        }

        const payload = {
            amount: parseFloat(amount),
            category_id: categoryId,
            description,
            transaction_date: new Date(transactionDate).toISOString(),
            type,
        };

        try {
            if (isEditMode && transactionToEdit) {
                await editTransaction(transactionToEdit.id, payload);
            } else {
                await addTransaction(payload as TransactionCreatePayload);
            }
            handleClose();
        } catch (error) {
            setLocalError('儲存失敗，請再試一次');
            console.error("Failed to save transaction from modal", error);
        }
    };

    if (!isOpen) return null;

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{isEditMode ? '編輯交易紀錄' : '新增交易紀錄'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                        <button type="button" onClick={() => setType('expense')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>支出</button>
                        <button type="button" onClick={() => setType('income')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${type === 'income' ? 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>收入</button>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">金額</label>
                        <input id="amount" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">分類</label>
                        <select id="category" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value="" disabled selected>請選擇一個分類</option>
                            {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">日期</label>
                        <input id="date" type="date" required value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">描述</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md"></textarea>
                    </div>
                    {(localError || contextError) && <p className="text-sm text-red-500">{localError || contextError}</p>}
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={handleClose} className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">取消</button>
                        <button type="submit" disabled={isContextLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                            {isContextLoading ? '儲存中...' : (isEditMode ? '更新交易' : '儲存交易')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- 主要的交易頁面 ---
export const TransactionPage = () => {
    const { transactions, fetchCategories, fetchTransactions, isLoading, removeTransaction } = useExpenses();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    useEffect(() => {
        const loadData = () => {
            fetchCategories();
            fetchTransactions();
        };
        loadData();
    }, [fetchCategories, fetchTransactions]);

    const handleOpenEditModal = (tx: Transaction) => {
        setTransactionToEdit(tx);
        setIsModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setTransactionToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('您確定要刪除這筆交易嗎？')) {
            await removeTransaction(id);
        }
    };

    return (
        <div className="container mx-auto">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">交易紀錄</h1>
                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-transform hover:scale-105"
                >
                    + 新增交易
                </button>
            </header>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transactionToEdit={transactionToEdit}
            />

            <div className="space-y-3">
                {isLoading && transactions.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">載入交易紀錄中...</p>
                ) : transactions.length > 0 ? (
                    transactions.map(tx => (
                        <div key={tx.id} className="bg-white dark:bg-gray-800/50 p-4 rounded-lg flex items-center shadow-sm border border-transparent hover:border-indigo-500/50 transition-all">
                            <div className="flex-1">
                                <p className="font-bold text-gray-800 dark:text-gray-100">{tx.category.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{tx.description || '無描述'}</p>
                            </div>
                            <div className="text-right mx-4">
                                <p className={`font-bold text-lg ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                                    {tx.type === 'expense' ? '-' : '+'} ${tx.amount.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenEditModal(tx)} title="編輯" className="p-2 text-gray-500 hover:text-indigo-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </button>
                                <button onClick={() => handleDelete(tx.id)} title="刪除" className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">沒有交易紀錄，新增一筆開始吧！</p>
                    </div>
                )}
            </div>
        </div>
    );
};