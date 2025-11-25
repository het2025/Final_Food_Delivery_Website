import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useDelivery();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
