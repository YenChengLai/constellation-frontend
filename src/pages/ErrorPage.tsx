import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

const StarryBackground = () => (
    <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-gradient-to-b dark:from-[#0c0c1d] dark:to-[#111132] transition-colors duration-300 -z-20"></div>
);

export const ErrorPage = () => {
    const error = useRouteError();
    let errorMessage: string;
    let errorStatus: number | string = 'Error';

    if (isRouteErrorResponse(error)) {
        errorStatus = error.status;
        errorMessage = error.statusText || 'An unexpected route error occurred.';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        errorMessage = 'An unknown error occurred.';
    }

    console.error(error);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-transparent text-gray-900 dark:text-gray-200 text-center px-4">
            <StarryBackground />
            <div className="w-full max-w-lg p-8 bg-white/80 dark:bg-black/30 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
                <h1 className="text-6xl font-bold text-indigo-500 dark:text-indigo-400">{errorStatus}</h1>
                <p className="mt-4 text-xl text-gray-700 dark:text-gray-300">Oops! Something went wrong.</p>
                <p className="mt-2 text-base text-red-600 dark:text-red-400">
                    <code>{errorMessage}</code>
                </p>
                <p className="mt-6 text-gray-600 dark:text-gray-400">
                    It seems we've hit a cosmic anomaly. Let's get you back on track.
                </p>
                <Link
                    to="/"
                    className="mt-6 inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
};