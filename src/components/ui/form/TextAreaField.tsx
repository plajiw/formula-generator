import React from 'react';

interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled = false,
  maxLength = 500,
  rows = 4
}) => {
  const charCount = value.length;
  const charPercentage = (charCount / maxLength) * 100;
  const isNearLimit = charPercentage > 80;

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
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
          p-3 resize-none font-sans
          ${error ? 'border-red-500 dark:border-red-500' : ''}
        `}
      />
      <div className="flex items-center justify-between gap-2 text-xs">
        {error && (
          <p className="text-red-600 dark:text-red-400">
            ⚠️ {error}
          </p>
        )}
        <p className={`ml-auto ${isNearLimit ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>
          {charCount} / {maxLength}
        </p>
      </div>
    </div>
  );
};
