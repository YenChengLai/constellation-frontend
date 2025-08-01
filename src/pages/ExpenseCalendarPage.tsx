import React, { useState, useEffect, useMemo, useRef } from 'react'; // ✨ 1. 引入 useRef
import { useExpenses } from '../contexts/ExpenseContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

export const ExpenseCalendarPage = () => {
    const { transactions, fetchTransactions, loading } = useExpenses();
    const [viewDate, setViewDate] = useState(new Date());
    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth() + 1;
        fetchTransactions(year, month);
    }, [viewDate, fetchTransactions]);

    // ✨ 3. 新增一個 useEffect，當 viewDate 改變時，命令日曆跳轉
    useEffect(() => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            calendarApi.gotoDate(viewDate);
        }
    }, [viewDate]);


    const calendarEvents = useMemo(() => {
        return transactions.map(tx => ({
            id: tx.id,
            title: `${tx.description || tx.category.name}: ${tx.type === 'expense' ? '-' : '+'}$${tx.amount.toFixed(2)}`,
            start: tx.transaction_date,
            allDay: true,
            backgroundColor: tx.type === 'expense' ? '#EF4444' : '#10B981',
            borderColor: tx.type === 'expense' ? '#EF4444' : '#10B981',
        }));
    }, [transactions]);

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

    return (
        <div className="container mx-auto h-full flex flex-col">
            <header className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">交易日曆</h1>
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                        <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">◀</button>
                        <span className="font-semibold w-32 text-center text-gray-700 dark:text-gray-300">
                            {viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月
                        </span>
                        <button onClick={handleNextMonth} disabled={isNextMonthDisabled} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed">▶</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0 relative">
                {loading.transactions && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">正在載入新的月份資料...</p>
                    </div>
                )}
                <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl shadow-sm h-full">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={calendarEvents}
                        height="100%"
                        headerToolbar={false}
                    />
                </div>
            </div>
        </div>
    );
};