import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import RestaurantOwnerRegisterModal from './components/RestaurantOwnerRegisterModal';
import RestaurantOwnerLoginModal from './components/RestaurantOwnerLoginModal';
import RestaurantOwnerSidebarLayout from './components/RestaurantOwnerSidebarLayout';

// Landing page
import HeroWithInfoSection from './components/RestaurantOwnerLandingPage';

// ✅ ONLY THESE PAGES NOW
import RestaurantOwnerDashboardPage from './components/pages/RestaurantOwnerDashboardPage';
import RestaurantOwnerOrdersPage from './components/pages/RestaurantOwnerOrdersPage';
import ProfileSettings from './components/pages/ProfileSettings';
import RestaurantOwnerMenuManagementPage from './components/pages/RestaurantOwnerMenuManagementPage';
// Protected route
import ProtectedRestaurantOwnerRoute from './routes/ProtectedVendorRoute';
import './index.css';

function AppRoutes({ toggleModal, toggleLoginModal }) {
  return (
    <Routes>
      {/* Public landing page */}
      <Route
        path="/"
        element={
          <HeroWithInfoSection
            onRegisterClick={toggleModal}
            onLoginClick={toggleLoginModal}
          />
        }
      />

      {/* Protected restaurant owner dashboard routes */}
      <Route element={<ProtectedRestaurantOwnerRoute />}>
        <Route path="/dashboard" element={<RestaurantOwnerSidebarLayout />}>
          {/* Dashboard home */}
          <Route index element={<RestaurantOwnerDashboardPage />} />
          
          {/* Orders */}
          <Route path="orders" element={<RestaurantOwnerOrdersPage />} />
          
          {/* Menu Management */}
          <Route path="menu" element={<RestaurantOwnerMenuManagementPage />} />
          
          {/* Profile Settings */}
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
      </Route>

      {/* Fallback: redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const toggleLoginModal = () => setIsLoginModalOpen((prev) => !prev);

  return (
    <Router>
      <div className="min-h-screen font-sans bg-gray-50">
        <AppRoutes
          toggleModal={toggleModal}
          toggleLoginModal={toggleLoginModal}
        />

        {/* Register Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <RestaurantOwnerRegisterModal isOpen={isModalOpen} onClose={toggleModal} />
          )}
        </AnimatePresence>

        {/* Login Modal */}
        <AnimatePresence>
          {isLoginModalOpen && (
            <RestaurantOwnerLoginModal
              isOpen={isLoginModalOpen}
              onClose={toggleLoginModal}
              onRegisterClick={toggleModal}
              onLoginSuccess={() => {
                // Modal already handles closing
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;
