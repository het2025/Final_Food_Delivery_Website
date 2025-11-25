import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/axiosInstance';

const DeliveryContext = createContext();

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within DeliveryProvider');
  }
  return context;
};

export const DeliveryProvider = ({ children }) => {
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('deliveryToken'));

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('deliveryToken');
      
      if (storedToken) {
        try {
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setDeliveryBoy(response.data.data);
            setToken(storedToken);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('deliveryToken');
          setToken(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.data.success) {
        const { token, deliveryBoy } = response.data.data;
        localStorage.setItem('deliveryToken', token);
        setToken(token);
        setDeliveryBoy(deliveryBoy);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (formData) => {
    try {
      const response = await authAPI.register(formData);
      
      if (response.data.success) {
        const { token, deliveryBoy } = response.data.data;
        localStorage.setItem('deliveryToken', token);
        setToken(token);
        setDeliveryBoy(deliveryBoy);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('deliveryToken');
      setToken(null);
      setDeliveryBoy(null);
    }
  };

  const updateDeliveryBoy = (updatedData) => {
    setDeliveryBoy(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    deliveryBoy,
    token,
    loading,
    login,
    register,
    logout,
    updateDeliveryBoy,
    isAuthenticated: !!token
  };

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
};
