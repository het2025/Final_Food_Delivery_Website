import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, addressService } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    const initializeUser = async () => {
      setLoading(true); // Start loading at the beginning of initialization
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Always fetch fresh profile data if a token exists
          const profileResponse = await authService.getProfile();
          if (profileResponse.success) {
            setUser(profileResponse.data.user);
            localStorage.setItem('user', JSON.stringify(profileResponse.data.user));

            const addressesResponse = await addressService.getAddresses();
            if (addressesResponse.success) {
              setAddresses(addressesResponse.data);
            }
          } else {
            console.error('Failed to fetch user profile, logging out.');
            logoutUser(); // Log out if profile fetch fails (e.g., token expired)
          }
        }
      } catch (error) {
        console.error('Error during user initialization or profile fetch:', error);
        logoutUser(); // Log out on any initialization error
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const loginUser = async (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    // Fetch addresses after login
    try {
      const response = await addressService.getAddresses();
      if (response.success) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const logoutUser = useCallback(() => {
    console.log('Logging out user...');
    setUser(null);
    setAddresses([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    authService.logout();
    console.log('User logged out successfully');
  }, [setUser, setAddresses]); // Dependencies for useCallback

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authService.getProfile();
        if (response.success) {
          setUser(response.data.user);
          localStorage.setItem('user', JSON.stringify(response.data.user)); // Update local storage
          const addressesResponse = await addressService.getAddresses();
          if (addressesResponse.success) {
            setAddresses(addressesResponse.data);
          }
        } else {
          logoutUser(); // Log out if profile fetch fails (e.g., token expired)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logoutUser(); // Log out on error
    } finally {
      setLoading(false);
    }
  }, [setUser, setAddresses, setLoading, logoutUser]);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Address management with backend sync
  const addAddress = async (newAddress) => {
    try {
      const response = await addressService.addAddress(newAddress);
      if (response.success) {
        setAddresses(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  };

  const updateAddress = async (addressId, updatedAddress) => {
    try {
      const response = await addressService.updateAddress(addressId, updatedAddress);
      if (response.success) {
        setAddresses(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const response = await addressService.deleteAddress(addressId);
      if (response.success) {
        setAddresses(response.data);
      }
      return response;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  };

  const contextValue = React.useMemo(() => ({
    user, 
    loading,
    setUser, 
    loginUser, 
    logoutUser, 
    updateUser,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    refreshUser: fetchUserProfile
  }), [
    user, 
    loading,
    addresses,
    fetchUserProfile,
    logoutUser
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;
