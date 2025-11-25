import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Simple protected route for restaurant owner dashboard
function ProtectedRestaurantOwnerRoute() {  // Renamed for consistency
  const token = localStorage.getItem('restaurantOwnerToken');  // Updated token key (not 'vendorToken')

  // If no token, redirect to home (or a dedicated /login route)
  if (!token) {
    return <Navigate to="/" replace />;  // Or <Navigate to="/login" replace /> if separate login page
  }

  // If token exists, render nested protected routes
  return <Outlet />;
}

export default ProtectedRestaurantOwnerRoute;  // Updated export name
