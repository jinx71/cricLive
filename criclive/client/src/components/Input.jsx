import React from 'react';

const Input = React.forwardRef(
  ({ label, id, error, className = '', type = 'text', ...rest }, ref) => {
    const inputId = id || rest.name;
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`px-3.5 py-2.5 rounded-xl border bg-white text-slate-800 placeholder:text-slate-400
            transition focus:outline-none focus:ring-2 focus:ring-brand-300
            ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200'}`}
          {...rest}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
