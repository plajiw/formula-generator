import React from 'react';

interface InputFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  icon,
  size = 'md',
  fullWidth = true,
  disabled = false,
  type = 'text'
}) => {
  const sizeClasses = {
    sm: 'h-8 text-sm px-2',
    md: 'h-10 text-base px-3',
    lg: 'h-12 text-lg px-4'
  };

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full rounded-lg border-2 transition-all duration-200
            bg-white dark:bg-slate-800
            border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            focus:border-blue-500 dark:focus:border-blue-400
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeClasses[size]}
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 dark:border-red-500' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};
