import React, { useMemo, useEffect, useState } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// 註冊 Chart.js 需要的元件
ChartJS.register(ArcElement, Tooltip, Legend);

// --- 子元件定義 ---

// 總覽卡片
const SummaryCard = ({ title, amount, colorClass }: { title: string, amount: number, colorClass: string }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>${amount.toFixed(2)}</p>
    </div>
);

// 圓餅圖
const CategoryDoughnutChart = ({ chartData }: { chartData: { labels: string[], datasets: any[] } }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-4">支出分類</h3>
        <div className="relative flex-1 flex items-center justify-center">
            <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
    </div>
);

// 大額支出列表
const TopExpensesList = ({ expenses }: { expenses: { category: string, description: string, amount: number }[] }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">本月大額支出</h3>
        <ul className="space-y-3">
            {expenses.map((exp, index) => (
                <li key={index} className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{exp.category}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{exp.description}</p>
                    </div>
                    <p className="font-semibold text-red-500">-${exp.amount.toFixed(2)}</p>
                </li>
            ))}
        </ul>
    </div>
);


// --- 主要的儀表板頁面 ---
export const ExpenseDashboardPage = () => {
    const { transactions, summary, fetchTransactions, fetchCategories } = useExpenses();
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth() + 1;
        fetchTransactions(year, month);
    }, [viewDate, fetchTransactions]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // 使用 useMemo 來準備圓餅圖需要的資料
    const categoryChartData = useMemo(() => {
        const expenseByCategory = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((acc, tx) => {
                const name = tx.category.name;
                acc[name] = (acc[name] || 0) + tx.amount;
                return acc;
            }, {} as { [key: string]: number });

        const labels = Object.keys(expenseByCategory);
        const data = Object.values(expenseByCategory);

        return {
            labels,
            datasets: [{
                label: '支出',
                data,
                backgroundColor: [
                    'rgba(79, 70, 229, 0.7)', 'rgba(234, 179, 8, 0.7)', 'rgba(220, 38, 38, 0.7)',
                    'rgba(22, 163, 74, 0.7)', 'rgba(219, 39, 119, 0.7)', 'rgba(14, 165, 233, 0.7)'
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
            }]
        };
    }, [transactions]);

    // 使用 useMemo 來找出前五大筆支出
    const topExpenses = useMemo(() => {
        return transactions
            .filter(tx => tx.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(tx => ({
                category: tx.category.name,
                description: tx.description || '無描述',
                amount: tx.amount,
            }));
    }, [transactions]);

    return (
        <div className="container mx-auto">
            <header className="flex justify-between items-center mb-8">
                {/* 月份選擇器等 Header 內容可以放在這裡，暫時從簡 */}
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">儀表板</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左上 & 右上: 總覽卡片 */}
                <SummaryCard title="本月總收入" amount={summary.income} colorClass="text-green-500" />
                <SummaryCard title="本月總支出" amount={summary.expense} colorClass="text-red-500" />
                <SummaryCard title="淨結餘" amount={summary.balance} colorClass={summary.balance >= 0 ? 'dark:text-white' : 'text-red-500'} />

                {/* 下半部：圖表和列表 */}
                <div className="lg:col-span-2">
                    <CategoryDoughnutChart chartData={categoryChartData} />
                </div>
                <div>
                    <TopExpensesList expenses={topExpenses} />
                </div>
            </div>
        </div>
    );
};