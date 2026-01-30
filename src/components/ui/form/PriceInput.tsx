import React from 'react';
import { DollarSign } from 'lucide-react';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  currency?: string;
}

export const PriceInput: React.FC<PriceInputProps> = ({
  value,
  onChange,
  label = 'Preço Unitário',
  error,
  disabled = false,
  currency = 'R$'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    onChange(Math.max(0, val));
  };

  const handleIncrement = () => {
    onChange(parseFloat((value + 0.01).toFixed(2)));
  };

  const handleDecrement = () => {
    onChange(Math.max(0, parseFloat((value - 0.01).toFixed(2))));
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <DollarSign size={14} />
          <span className="text-xs font-bold">{currency}</span>
        </div>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= 0}
          className="absolute left-16 h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          step="0.01"
          min="0"
          disabled={disabled}
          className={`
            w-full h-10 rounded-lg border-2 transition-all duration-200
            bg-white dark:bg-slate-800
            border-slate-200 dark:border-slate-700
            text-right font-mono text-base
            text-slate-900 dark:text-white
            focus:border-blue-500 dark:focus:border-blue-400
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            pl-20 pr-10
            ${error ? 'border-red-500 dark:border-red-500' : ''}
          `}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled}
          className="absolute right-2 h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};
