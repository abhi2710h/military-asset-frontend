import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../utils/auth';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/purchases', label: 'Purchases', icon: '🛒' },
    { path: '/transfers', label: 'Transfers', icon: '🚚' },
    { path: '/assignments', label: 'Assignments', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Military Asset Management</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {user?.username} ({user?.role?.replace('_', ' ')})
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-6 py-4 inline-block transition ${
                  location.pathname === item.path
                    ? 'border-b-2 border-blue-900 text-blue-900 font-semibold'
                    : 'text-gray-600 hover:text-blue-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

