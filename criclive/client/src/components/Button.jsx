import React from 'react';

const variants = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-400 disabled:bg-brand-300',
  secondary:
    'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 focus:ring-brand-300',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50 focus:ring-brand-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400',
  gold: 'bg-accent-gold text-slate-900 hover:brightness-95 focus:ring-amber-300',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  loading = false,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl shadow-sm
      transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed
      ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    {...rest}
  >
    {loading && (
      <span
        className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        aria-hidden="true"
      />
    )}
    {children}
  </button>
);

export default Button;
