import React from 'react';

export const ContextHeader = ({
    title,
    subtitle,
    badge,
    actions,
    className,
}: {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={`no-print ds-card p-4 sm:p-5 mb-6 ${className || ''}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
                        {badge && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-200">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};
