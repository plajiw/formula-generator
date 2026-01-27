import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-950 dark:to-neutral-900 text-slate-900 dark:text-slate-100 font-sans selection:bg-[var(--primary)] selection:text-white transition-colors duration-300">
            {children}
        </div>
    );
};
