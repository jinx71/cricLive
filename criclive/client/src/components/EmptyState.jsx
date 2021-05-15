import React from 'react';

const EmptyState = ({ title = 'Nothing here yet', message, icon = '🏏', action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6 bg-white rounded-xl border border-dashed border-slate-200">
    <div className="text-5xl mb-3" aria-hidden="true">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    {message && <p className="mt-1.5 text-sm text-slate-500 max-w-md">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
