import React from 'react';

const VARIANTS = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  amber: 'bg-amber-50 text-amber-800 border-amber-200/60',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/60',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200/60'
};

const SIZES = {
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-xs'
};

const Badge = ({ children, variant = 'slate', size = 'md', className = '' }) => {
  const variantClass = VARIANTS[variant] || VARIANTS.slate;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded border ${variantClass} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
