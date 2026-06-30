import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Scores', end: true },
  { to: '/series', label: 'Series' },
  { to: '/points', label: 'Standings' },
  { to: '/players', label: 'Players' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-xl tracking-tight">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent-gold text-brand-900 shadow-md">
              🏏
            </span>
            <span>CricLive</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-brand-100 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
                >
                  Hi, {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-lg bg-accent-gold text-brand-900 font-semibold hover:brightness-95 transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm px-3 py-1.5 rounded-lg text-brand-100 hover:text-white hover:bg-white/10 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-3 py-1.5 rounded-lg bg-accent-gold text-brand-900 font-semibold hover:brightness-95 transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-3 pt-1 flex flex-col gap-1 animate-fade-in">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="border-t border-white/10 mt-2 pt-2 flex flex-col gap-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-white/10"
                  >
                    Dashboard ({user.name.split(' ')[0]})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-accent-gold text-brand-900 text-left"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-brand-100"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-accent-gold text-brand-900"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
