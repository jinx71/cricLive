import React from 'react';

const tones = {
  slate: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-800',
  live: 'bg-red-100 text-red-700',
  gold: 'bg-amber-100 text-amber-800',
  pitch: 'bg-emerald-100 text-emerald-800',
  white: 'bg-white text-slate-700 border border-slate-200',
};

const Badge = ({ children, tone = 'slate', pulse = false, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
      ${tones[tone] || tones.slate} ${className}`}
  >
    {pulse && (
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70 animate-pulse-live" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
      </span>
    )}
    {children}
  </span>
);

export default Badge;
