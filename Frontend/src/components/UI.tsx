import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-[#F27D26] text-white hover:bg-[#d96d1d] shadow-sm',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    outline: 'border border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-700',
    ghost: 'hover:bg-zinc-100 text-zinc-600',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
    md: 'px-4 py-2 text-sm font-medium rounded-xl',
    lg: 'px-6 py-3 text-base font-medium rounded-2xl',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden', className)}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input
    className={cn(
      'flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F27D26] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={cn('text-sm font-medium text-zinc-700 mb-1.5 block', className)} {...props} />
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({ children, variant, className }) => {
  const variants: Record<string, string> = {
    SUBMITTED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    UNDER_REVIEW: 'bg-orange-100 text-orange-700 border-orange-200',
    ASSIGNED: 'bg-blue-100 text-blue-700 border-blue-200',
    IN_PROGRESS: 'bg-purple-100 text-purple-700 border-purple-200',
    RESOLVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-red-50 text-red-600 border-red-100',
    MEDIUM: 'bg-amber-50 text-amber-600 border-amber-100',
    LOW: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    URGENT: 'bg-rose-100 text-rose-700 border-rose-200 font-bold',
  };

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', variants[variant || ''] || 'bg-zinc-100 text-zinc-600 border-zinc-200', className)}>
      {children}
    </span>
  );
};
