import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  BellIcon 
} from '@heroicons/react/24/outline';

const Header = () => {
  const navigate = useNavigate();
  const { deliveryBoy, logout } = useDelivery();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">QuickBite</h1>
            <span className="ml-2 text-sm text-gray-600">Delivery</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Online Status */}
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${deliveryBoy?.isOnline ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
              <span className="text-sm text-gray-600">
                {deliveryBoy?.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center text-gray-700 hover:text-primary"
            >
              <UserCircleIcon className="w-6 h-6" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-700 hover:text-red-600"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
