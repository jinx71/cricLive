import React from 'react';

const Tabs = ({ tabs, value, onChange, className = '' }) => (
  <div
    role="tablist"
    className={`inline-flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
  >
    {tabs.map((t) => {
      const active = t.value === value;
      return (
        <button
          key={t.value}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(t.value)}
          className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition
            ${
              active
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-brand-700 hover:bg-brand-50'
            }`}
        >
          <span className="flex items-center gap-1.5">
            {t.icon}
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={`ml-1 text-[10px] font-bold px-1.5 rounded-full ${
                  active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.count}
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

export default Tabs;
