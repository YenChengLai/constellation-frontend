import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import Emoji from 'react-emoji-render';
import { useExpenses } from '../contexts/ExpenseContext';
import type { Category, CategoryCreatePayload, UpdateCategoryPayload } from '../services/api.types';
import { useAuth } from '../contexts/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { useClickOutside } from '../hooks/useClickOutside';

// --- 新增/編輯分類的彈出視窗 (Modal) 元件 ---
const CategoryModal = ({ isOpen, onClose, categoryToEdit }: {
    isOpen: boolean,
    onClose: () => void,
    categoryToEdit: Category | null
}) => {
    const { createCategory, editCategory, loading } = useExpenses();
    const isEditMode = !!categoryToEdit;

    const [name, setName] = useState('');
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [icon, setIcon] = useState(':file_folder:');
    const [localError, setLocalError] = useState<string | null>(null);
    const [showPicker, setShowPicker] = useState(false);

    const pickerRef = useClickOutside<HTMLDivElement>(() => {
        setShowPicker(false);
    });

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && categoryToEdit) {
                setName(categoryToEdit.name);
                setType(categoryToEdit.type);
                setIcon(categoryToEdit.icon || ':file_folder:');
            } else {
                setName('');
                setType('expense');
                setIcon(':file_folder:');
                setLocalError(null);
            }
        }
    }, [isOpen, isEditMode, categoryToEdit]);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setIcon(emojiData.emoji);
        setShowPicker(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!name.trim()) {
            setLocalError("Category name cannot be empty.");
            return;
        }

        try {
            if (isEditMode && categoryToEdit) {
                const payload: UpdateCategoryPayload = { name, icon };
                await editCategory(categoryToEdit._id, payload);
            } else {
                const payload: CategoryCreatePayload = { name, type, icon };
                await createCategory(payload);
            }
            onClose();
        } catch (error: any) {
            setLocalError(error.response?.data?.detail || "An error occurred.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{isEditMode ? '編輯分類' : '新增分類'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="relative" ref={pickerRef}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">圖示</label>
                            <button type="button" onClick={() => setShowPicker(prev => !prev)} className="mt-1 w-16 h-10 flex items-center justify-center text-2xl bg-gray-100 dark:bg-gray-700/50 rounded-md">
                                <Emoji text={icon} />
                            </button>
                            {showPicker && (
                                <div className="absolute bottom-full mb-2 z-20">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">分類名稱</label>
                            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">類型</label>
                        <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} disabled={isEditMode} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50">
                            <option value="expense">支出</option>
                            <option value="income">收入</option>
                        </select>
                    </div>
                    {localError && <p className="text-sm text-red-500">{localError}</p>}
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium">取消</button>
                        <button type="submit" disabled={loading.mutating} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {loading.mutating ? '儲存中...' : '儲存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const CategoryManagementPage = () => {
    const { categories, loading, removeCategory, fetchCategories } = useExpenses();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

    useEffect(() => {
        // 如果分類為空，則獲取一次
        if (categories.length === 0) {
            fetchCategories();
        }
    }, [categories.length, fetchCategories]);

    const { expenseCategories, incomeCategories } = useMemo(() => {
        const expense: Category[] = [];
        const income: Category[] = [];
        categories.forEach(cat => {
            if (cat.type === 'expense') expense.push(cat);
            else if (cat.type === 'income') income.push(cat);
        });
        return { expenseCategories: expense, incomeCategories: income };
    }, [categories]);

    const handleOpenAddModal = () => {
        setCategoryToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: Category) => {
        if (!category.user_id) return;
        setCategoryToEdit(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('確定要刪除這個分類嗎？提醒：只有未被任何交易使用的分類才能被刪除。')) {
            try {
                await removeCategory(id);
                await fetchCategories();
            } catch (error: any) {
                alert(error.response?.data?.detail || "刪除失敗");
            }
        }
    };

    const CategoryList = ({ title, list }: { title: string, list: Category[] }) => (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>
            {loading.categories ? <p>載入中...</p> : (
                <ul className="space-y-2">
                    {list.map(cat => (
                        <li key={cat._id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50">
                            <span className="flex items-center gap-3">
                                <span className="text-xl">
                                    <Emoji text={cat.icon || ':file_folder:'} />
                                </span>
                                <span>{cat.name}</span>
                            </span>
                            {cat.user_id === user?._id && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEditModal(cat)} title="編輯" className="p-1 text-gray-500 hover:text-indigo-500">✏️</button>
                                    <button onClick={() => handleDelete(cat._id)} title="刪除" className="p-1 text-gray-500 hover:text-red-500">🗑️</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="container mx-auto">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">分類管理</h1>
                <button onClick={handleOpenAddModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ 新增分類</button>
            </header>

            <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} categoryToEdit={categoryToEdit} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CategoryList title="支出分類" list={expenseCategories} />
                <CategoryList title="收入分類" list={incomeCategories} />
            </div>
        </div>
    );
};