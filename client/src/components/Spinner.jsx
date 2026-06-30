import React from 'react';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-4',
};

const Spinner = ({ size = 'md', label = 'Loading', className = '' }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`} role="status">
    <span
      className={`inline-block ${sizes[size] || sizes.md} border-brand-500 border-t-transparent rounded-full animate-spin`}
      aria-hidden="true"
    />
    {label && <span className="text-sm text-slate-500">{label}…</span>}
  </div>
);

export default Spinner;
