import React from 'react';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  error?: string;
  unit?: string;
  disabled?: boolean;
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  step = 0.1,
  min = 0,
  max,
  error,
  unit,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    if (max === undefined || val <= max) {
      onChange(val);
    }
  };

  const handleIncrement = () => {
    const newVal = value + step;
    if (max === undefined || newVal <= max) {
      onChange(newVal);
    }
  };

  const handleDecrement = () => {
    const newVal = Math.max(min, value - step);
    onChange(newVal);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Quantidade {unit && `(${unit})`}
      </label>
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="absolute left-2 h-8 w-8 flex items-center justify-center rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className={`
            w-full h-10 rounded-lg border-2 transition-all duration-200
            bg-white dark:bg-slate-800
            border-slate-200 dark:border-slate-700
            text-center font-mono text-base
            text-slate-900 dark:text-white
            focus:border-blue-500 dark:focus:border-blue-400
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            px-10
            ${error ? 'border-red-500 dark:border-red-500' : ''}
          `}
        />
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && value >= max)}
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
      {value === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
          ⚠️ Quantidade zerada
        </p>
      )}
    </div>
  );
};
