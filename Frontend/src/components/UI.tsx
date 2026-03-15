import React from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'success' | 'warning' | 'accent';
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
    primary: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-premium hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-premium hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-premium hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    accent: 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-premium hover:shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    secondary: 'bg-slate-50 text-slate-900 shadow-soft hover:bg-slate-100 border-none',
    outline: 'border-2 border-slate-100 bg-transparent hover:border-blue-100 hover:bg-blue-50/50 text-slate-700',
    ghost: 'hover:bg-slate-100/50 text-slate-600',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-premium hover:shadow-rose-500/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    glass: 'glass hover:bg-white/90 text-slate-900',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs font-bold rounded-xl',
    md: 'px-6 py-3 text-sm font-bold rounded-2xl',
    lg: 'px-8 py-4 text-base font-bold rounded-[2rem]',
    icon: 'p-3 rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none',
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

export const Card: React.FC<{ children: React.ReactNode; className?: string; glass?: boolean; hover?: boolean }> = ({ 
  children, 
  className,
  glass = false,
  hover = true
}) => (
  <div className={cn(
    'rounded-[32px] transition-all duration-500 overflow-hidden',
    glass ? 'glass' : 'bg-white shadow-premium',
    hover && 'hover:shadow-soft hover:-translate-y-1',
    className
  )}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input
    className={cn(
      'flex h-12 w-full rounded-2xl border-2 border-slate-100 bg-white px-5 py-2 text-sm transition-all placeholder:text-slate-400 focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-soft',
      className
    )}
    {...props}
  />
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={cn('text-sm font-bold text-slate-700 mb-2 ml-1 block', className)} {...props} />
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({ children, variant, className }) => {
  const variants: Record<string, string> = {
    SUBMITTED: 'bg-blue-50 text-blue-600 border border-blue-100/50',
    UNDER_REVIEW: 'bg-violet-50 text-violet-600 border border-violet-100/50',
    ASSIGNED: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50',
    IN_PROGRESS: 'bg-blue-100/50 text-blue-700 border border-blue-200/50',
    RESOLVED: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
    REJECTED: 'bg-rose-50 text-rose-600 border border-rose-100/50',
    HIGH: 'bg-rose-50 text-rose-600 font-bold border border-rose-100/50',
    MEDIUM: 'bg-amber-50 text-amber-600 border border-amber-100/50',
    LOW: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
    URGENT: 'bg-rose-600 text-white shadow-premium font-bold',
  };

  return (
    <span className={cn(
      'px-3.5 py-1 rounded-full text-[10px] font-black transition-all duration-300 uppercase tracking-widest inline-flex items-center', 
      variants[variant || ''] || 'bg-slate-100 text-slate-500', 
      className
    )}>
      {children}
    </span>
  );
};
