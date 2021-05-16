import React from 'react';
import Button from './Button';

const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-red-50 border border-red-200 rounded-xl">
    <div className="text-4xl mb-2" aria-hidden="true">
      ⚠️
    </div>
    <h3 className="text-base font-semibold text-red-800">Couldn't load</h3>
    <p className="mt-1 text-sm text-red-700 max-w-md">{message}</p>
    {onRetry && (
      <Button variant="danger" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
