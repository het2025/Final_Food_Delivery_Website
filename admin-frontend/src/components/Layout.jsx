import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  CreditCardIcon // ✅ NEW
} from '@heroicons/react/24/outline';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdmin();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/users', icon: UsersIcon },
    { name: 'Restaurants', href: '/restaurants', icon: BuildingStorefrontIcon },
    { name: 'Restaurant Approvals', href: '/restaurants/pending', icon: BellIcon, badge: true },
    { name: 'Bank Approvals', href: '/payouts/approvals', icon: CreditCardIcon }, // ✅ NEW
    { name: 'Orders', href: '/orders', icon: ShoppingCartIcon }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-dark transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex justify-between items-center px-6 h-16 bg-gray-900">
          <h1 className="text-xl font-bold text-white">QuickBite Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 lg:hidden hover:text-white"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-3 mt-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 mt-2 rounded-lg transition-colors ${isActive
                  ? 'text-white bg-primary'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                <item.icon className="mr-3 w-6 h-6" />
                <span>{item.name}</span>
                {/* {item.badge && (
                  <span className="px-2 py-1 ml-auto text-xs text-white bg-red-500 rounded-full">
                    New
                  </span>
                )} */}
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div className="absolute bottom-0 p-4 w-full bg-gray-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex justify-center items-center w-10 h-10 font-bold text-white rounded-full bg-primary">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{admin?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="flex justify-between items-center px-6 h-16 bg-white shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 lg:hidden hover:text-gray-900"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <h2 className="text-xl font-semibold text-gray-800">
            {navigation.find(item => item.href === location.pathname)?.name || 'Admin Panel'}
          </h2>

          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
