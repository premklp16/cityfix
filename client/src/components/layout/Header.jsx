import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCity, FaBell, FaBars, FaTimes, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'officer') return '/officer/dashboard';
    return '/dashboard';
  };

  const navLinks = [{ name: 'Home', path: '/' }];
  if (isAuthenticated && user?.role === 'citizen') {
    navLinks.push({ name: 'Report Issue', path: '/report' });
    navLinks.push({ name: 'My Complaints', path: '/my-complaints' });
  }

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl shadow-lg shadow-slate-900/10 border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 rounded-2xl bg-slate-900/90 px-3 py-2 shadow-sm shadow-slate-950/10 transition hover:bg-slate-800">
              <FaCity className="text-primary-400 text-2xl" />
              <span className="text-white text-lg font-semibold tracking-tight">CityFix</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${location.pathname === link.path
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-950/15'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/notifications"
                  className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-2 text-slate-300 transition hover:border-primary-500 hover:text-white hover:shadow-sm hover:shadow-primary-500/10"
                >
                  <FaBell className="text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger-500 px-1.5 text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="rounded-full border border-slate-800 bg-slate-900/90 p-1.5 transition hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-400/30"
                    aria-label="Open user menu"
                  >
                    <Avatar name={user?.name} src={user?.profileImage} size="sm" />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                        <Link
                          to={getDashboardPath()}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <FaTachometerAlt className="text-slate-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <FaUser className="text-slate-400" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <FaSignOutAlt className="text-slate-400" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-slate-300 transition hover:text-white text-sm font-medium">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm px-4 py-2">Register</Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/90 text-slate-300 transition hover:border-primary-500 hover:text-white md:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${location.pathname === link.path
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
