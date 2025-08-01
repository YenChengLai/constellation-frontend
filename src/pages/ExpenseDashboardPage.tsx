import React, { useMemo, useEffect, useState } from 'react';
import { useExpenses } from '../contexts/ExpenseContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// 註冊 Chart.js 需要的所有元件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

// --- 子元件定義 ---
const SummaryCard = ({ title, amount, percentageChange }: { title: string, amount: number, percentageChange: number | null }) => {
    const isPositive = percentageChange !== null && percentageChange >= 0;
    const isNegative = percentageChange !== null && percentageChange < 0;
    const isNeutral = percentageChange === 0;
    const colorClass = isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500';
    const indicator = isPositive ? '▲' : isNegative ? '▼' : '';

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${amount.toFixed(2)}</p>
                {percentageChange !== null && !isNeutral && (
                    <span className={`flex items-center text-sm font-semibold ${colorClass}`}>
                        {indicator} {Math.abs(percentageChange).toFixed(1)}%
                    </span>
                )}
            </div>
        </div>
    );
};

const CategoryDoughnutChart = ({ chartData }: { chartData: any }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm h-full flex flex-col min-h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">支出分類</h3>
        <div className="relative flex-1 flex items-center justify-center">
            <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563' } } } }} />
        </div>
    </div>
);

const DailyTrendChart = ({ chartData }: { chartData: any }) => (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm h-full flex flex-col min-h-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">每日支出趨勢</h3>
        <div className="relative flex-1">
            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
    </div>
);

// --- 主要的儀表板頁面 ---
export const ExpenseDashboardPage = () => {
    const { transactions, summaryData, fetchTransactions, fetchSummary, isLoading } = useExpenses();
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth() + 1;
        // 使用 Promise.all 平行獲取兩種資料
        Promise.all([
            fetchTransactions(year, month),
            fetchSummary(year, month)
        ]);
    }, [viewDate, fetchTransactions, fetchSummary]);

    const handlePrevMonth = () => {
        setViewDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 15));
    };

    const handleNextMonth = () => {
        setViewDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 15));
    };

    const isNextMonthDisabled = useMemo(() => {
        const today = new Date();
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfViewMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        return startOfViewMonth >= startOfCurrentMonth;
    }, [viewDate]);

    const percentageChanges = useMemo(() => {
        if (!summaryData) return { income: null, expense: null };
        const { current_month, previous_month } = summaryData;
        const calcChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };
        return {
            income: calcChange(current_month.income, previous_month.income),
            expense: calcChange(current_month.expense, previous_month.expense),
        };
    }, [summaryData]);

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
                label: '支出', data,
                backgroundColor: ['#4F46E5', '#F59E0B', '#EF4444', '#10B981', '#D946EF', '#0EA5E9'],
                borderColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                borderWidth: 2,
            }]
        };
    }, [transactions]);

    const dailyTrendData = useMemo(() => {
        const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
        const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
        const dailyExpenses = new Array(daysInMonth).fill(0);

        transactions
            .filter(tx => tx.type === 'expense')
            .forEach(tx => {
                const day = new Date(tx.transaction_date).getUTCDate();
                dailyExpenses[day - 1] += tx.amount;
            });

        return {
            labels,
            datasets: [{
                label: '每日支出', data: dailyExpenses,
                borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.2)',
                fill: true, tension: 0.3,
            }]
        };
    }, [transactions, viewDate]);

    if (isLoading || !summaryData) {
        return (
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">儀表板</h1>
                <p className="text-center text-gray-500 dark:text-gray-400">正在載入儀表板數據...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* ✨ 3. 更新 Header，加入月份選擇器 */}
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">儀表板</h1>
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                        <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">◀</button>
                        <span className="font-semibold w-32 text-center text-gray-700 dark:text-gray-300">
                            {viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月
                        </span>
                        <button
                            onClick={handleNextMonth}
                            disabled={isNextMonthDisabled}
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ▶
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <SummaryCard title="本月總收入" amount={summaryData.current_month.income} percentageChange={percentageChanges.income} />
                <SummaryCard title="本月總支出" amount={summaryData.current_month.expense} percentageChange={percentageChanges.expense} />
                <SummaryCard title="淨結餘" amount={summaryData.current_month.income - summaryData.current_month.expense} percentageChange={null} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DailyTrendChart chartData={dailyTrendData} />
                </div>
                <div>
                    <CategoryDoughnutChart chartData={categoryChartData} />
                </div>
            </div>
        </div>
    );
};