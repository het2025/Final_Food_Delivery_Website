import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  User,
  UtensilsCrossed,
  LogOut,
  Wallet // ✅ NEW
} from 'lucide-react';

function RestaurantOwnerSidebarLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem('restaurantOwnerToken');
    localStorage.removeItem('token');

    // Navigate to login and replace history (prevents back button)
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="flex flex-col p-6 w-64 bg-white shadow-xl">
        {/* Logo + Text */}
        <div className="flex gap-3 items-center mb-6">
          <img src="/quickbite_logo.svg" alt="QuickBite Logo" className="w-9 h-9" />
          <span className="text-2xl font-bold text-black">QuickBite</span>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>

          {/* Orders */}
          <NavLink
            to="/dashboard/orders"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <ClipboardList size={20} />
            <span>Orders</span>
          </NavLink>

          {/* ✅ Menu Management (between Orders and Profile) */}
          <NavLink
            to="/dashboard/menu"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <UtensilsCrossed size={20} />
            <span>Menu Management</span>
          </NavLink>

          {/* ✅ Payouts (below Menu Management) */}
          <NavLink
            to="/dashboard/payouts"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <Wallet size={20} />
            <span>Payouts</span>
          </NavLink>

          {/* Profile Settings */}
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 px-2 py-2 rounded ${isActive ? 'text-red-600 font-bold bg-red-50' : 'text-gray-700'
              } hover:text-red-600 hover:bg-red-50`
            }
          >
            <User size={20} />
            <span>Profile Settings</span>
          </NavLink>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex gap-2 items-center px-2 py-2 w-full font-medium text-red-600 rounded hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="overflow-y-auto flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default RestaurantOwnerSidebarLayout;
