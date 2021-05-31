import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFoundPage = () => (
  <div className="max-w-md mx-auto text-center px-4 py-20">
    <div className="text-6xl mb-4">🏏</div>
    <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-2">404</h1>
    <p className="text-slate-500 mb-6">
      That delivery missed the wicket. The page you're looking for doesn't exist.
    </p>
    <Link to="/">
      <Button variant="primary">Back to scores</Button>
    </Link>
  </div>
);

export default NotFoundPage;
