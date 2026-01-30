import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[] | string[];
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  fullWidth = true
}) => {
  const normalizedOptions: SelectOption[] = options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full h-10 rounded-lg border-2 transition-all duration-200 appearance-none
            bg-white dark:bg-slate-800
            border-slate-200 dark:border-slate-700
            text-slate-900 dark:text-white
            focus:border-blue-500 dark:focus:border-blue-400
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            px-3 pr-8
            font-mono text-sm font-bold uppercase
            ${error ? 'border-red-500 dark:border-red-500' : ''}
          `}
        >
          <option value="" disabled>
            Selecionar...
          </option>
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500"
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
