import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mt-12 border-t border-slate-200 bg-white">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-brand-100 text-brand-700">
          🏏
        </span>
        <span className="font-semibold text-slate-800">CricLive</span>
        <span className="text-slate-400">— smart caching around free-tier cricket APIs</span>
      </div>
      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
        <Link to="/cache" className="hover:text-brand-700">
          Cache diagnostics
        </Link>
        <span className="text-slate-300">•</span>
        <span>Data: CricketData.org / CricAPI</span>
        <span className="text-slate-300">•</span>
        <span>Portfolio app #9 — MERN 2021–2022 stack</span>
      </div>
    </div>
  </footer>
);

export default Footer;
