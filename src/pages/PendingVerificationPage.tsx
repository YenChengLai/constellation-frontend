import React from 'react';
import { Link } from 'react-router-dom';

const StarryBackground = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-gradient-to-b dark:from-[#0c0c1d] dark:to-[#111132] transition-colors duration-300 -z-20"></div>
);

export const PendingVerificationPage = () => {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-transparent text-gray-900 dark:text-gray-200 text-center px-4">
            <StarryBackground />
            <div className="w-full max-w-lg p-8 space-y-4 bg-white/80 dark:bg-black/30 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Registration Successful!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Thank you for joining Constellation. Your account is now pending approval from an administrator. You will be able to log in once it has been verified.
                </p>
                <Link
                    to="/login"
                    className="mt-6 inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
};