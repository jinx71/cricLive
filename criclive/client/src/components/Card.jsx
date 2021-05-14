import React from 'react';

const Card = ({ children, className = '', interactive = false, ...rest }) => (
  <div
    className={`bg-white rounded-xl shadow-card border border-slate-100
      ${interactive ? 'hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer' : ''}
      ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
