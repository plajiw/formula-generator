import React from 'react';

interface FormRowProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  columns = 2,
  gap = 'md',
  className = ''
}) => {
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  const gapMap = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  };

  return (
    <div
      className={`
        grid ${colsMap[columns]} ${gapMap[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
