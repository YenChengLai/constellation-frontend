import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import type { Account, AccountCreatePayload, AccountType, UpdateAccountPayload } from '../services/api.types';
import { useView } from '../contexts/ViewContext';

// --- ✨ 子元件：帳戶卡片 ---
const AccountCard = ({ account, onEdit }: { account: Account, onEdit: () => void }) => {
    const accountTypeMap: Record<AccountType, { icon: string, name: string }> = {
        bank: { icon: '🏦', name: '銀行帳戶' },
        credit_card: { icon: '💳', name: '信用卡' },
        cash: { icon: '💵', name: '現金' },
        'e-wallet': { icon: '📱', name: '電子錢包' },
        investment: { icon: '📈', name: '投資帳戶' },
        other: { icon: '📁', name: '其他' },
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm flex justify-between items-center">
            <div className="flex items-center gap-4">
                <span className="text-3xl">{accountTypeMap[account.type]?.icon || '📁'}</span>
                <div>
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">{account.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{accountTypeMap[account.type]?.name}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    ${account.balance.toFixed(2)}
                </p>
                <button onClick={onEdit} className="text-xs text-indigo-500 hover:underline">編輯</button>
            </div>
        </div>
    );
};

// --- ✨ 子元件：新增/編輯帳戶的彈出視窗 ---
const AccountModal = ({ isOpen, onClose, accountToEdit }: {
    isOpen: boolean,
    onClose: () => void,
    accountToEdit: Account | null
}) => {
    const { addAccount, editAccount, loading } = useExpenses();
    const { view } = useView();
    const isEditMode = !!accountToEdit;

    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('bank');
    const [initialBalance, setInitialBalance] = useState('0');
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && accountToEdit) {
                setName(accountToEdit.name);
                setType(accountToEdit.type);
                setInitialBalance(String(accountToEdit.initial_balance));
            } else {
                setName('');
                setType('bank');
                setInitialBalance('0');
                setLocalError(null);
            }
        }
    }, [isOpen, isEditMode, accountToEdit]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!name.trim()) { setLocalError("帳戶名稱不可為空"); return; }

        try {
            if (isEditMode && accountToEdit) {
                const payload: UpdateAccountPayload = { name };
                await editAccount(accountToEdit._id, payload);
            } else {
                const payload: AccountCreatePayload = {
                    name, type,
                    initial_balance: parseFloat(initialBalance) || 0,
                    group_id: view.type === 'group' ? view.groupId : undefined,
                };
                await addAccount(payload);
            }
            onClose();
        } catch (error: any) {
            setLocalError(error.response?.data?.detail || "儲存失敗");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{isEditMode ? '編輯帳戶' : '新增帳戶'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">帳戶名稱</label>
                        <input id="name" type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium">類型</label>
                        <select id="type" value={type} onChange={e => setType(e.target.value as any)} disabled={isEditMode} className="mt-1 block w-full px-3 py-2 rounded-md disabled:opacity-50">
                            <option value="bank">銀行帳戶</option>
                            <option value="credit_card">信用卡</option>
                            <option value="cash">現金</option>
                            <option value="e-wallet">電子錢包</option>
                            <option value="investment">投資帳戶</option>
                            <option value="other">其他</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="initial_balance" className="block text-sm font-medium">初始餘額</label>
                        <input id="initial_balance" type="number" step="0.01" value={initialBalance} onChange={e => setInitialBalance(e.target.value)} disabled={isEditMode} className="mt-1 block w-full px-3 py-2 rounded-md disabled:opacity-50" />
                    </div>
                    {localError && <p className="text-sm text-red-500">{localError}</p>}
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="w-full justify-center py-2 px-4 rounded-md border">取消</button>
                        <button type="submit" disabled={loading.mutating} className="w-full justify-center py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {loading.mutating ? '儲存中...' : '儲存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- ✨ 主要的帳戶管理頁面 ---
export const AccountManagementPage = () => {
    const { accounts, fetchAccounts, loading } = useExpenses();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleOpenEditModal = (account: Account) => {
        setAccountToEdit(account);
        setIsModalOpen(true);
    };

    return (
        <div className="container mx-auto">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">帳戶管理</h1>
                <button
                    onClick={() => { setAccountToEdit(null); setIsModalOpen(true); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    + 新增帳戶
                </button>
            </header>

            <AccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                accountToEdit={accountToEdit}
            />

            {loading.accounts ? (
                <p className="text-center text-gray-500 dark:text-gray-400">載入帳戶中...</p>
            ) : accounts.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">尚未建立任何帳戶。</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {accounts.map(acc => (
                        <AccountCard key={acc._id} account={acc} onEdit={() => handleOpenEditModal(acc)} />
                    ))}
                </div>
            )}
        </div>
    );
};