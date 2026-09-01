import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent shadow-sm focus:ring-2 focus:ring-indigo-500/20 active:bg-indigo-800',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-2 focus:ring-slate-400/20 active:bg-slate-100',
  outline: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-2 focus:ring-slate-400/20',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white border border-transparent shadow-sm focus:ring-2 focus:ring-rose-500/20',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-transparent shadow-sm focus:ring-2 focus:ring-emerald-500/20'
};

const SIZES = {
  xs: 'px-2 py-1 text-xs rounded',
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md',
  md: 'px-3.5 py-2 text-sm font-medium rounded-lg',
  lg: 'px-4 py-2.5 text-base font-medium rounded-lg'
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyles = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

export default Button;
