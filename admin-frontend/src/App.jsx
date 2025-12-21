import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Restaurants from './pages/Restaurants';
import RestaurantApprovals from './pages/RestaurantApprovals';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import UserDetails from './pages/UserDetails';
import AdminPayoutsPage from './pages/AdminPayoutsPage'; // ✅ NEW
import Analysis from './pages/Analysis'; // ✅ NEW: Analytics

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <AdminProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:id" element={<UserDetails />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurants/pending" element={<RestaurantApprovals />} />
              <Route path="/payouts/approvals" element={<AdminPayoutsPage />} /> {/* ✅ NEW */}
              <Route path="/analytics" element={<Analysis />} /> {/* ✅ NEW */}
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AdminProvider>
    </Router>
  );
}

export default App;
