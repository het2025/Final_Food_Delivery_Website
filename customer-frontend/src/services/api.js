import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICE
// ============================================
export const authService = {
  register: async (userData) => {
    try {
      console.log('Registering user:', { ...userData, password: '***' });
      
      const response = await api.post('/auth/register', userData);
      
      console.log('Registration response:', response.data);
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.request) {
        throw { 
          success: false, 
          message: 'Network error. Please check if the backend server is running on port 5000.' 
        };
      } else {
        throw { 
          success: false, 
          message: error.message || 'Registration failed. Please try again.' 
        };
      }
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.request) {
        throw { 
          success: false, 
          message: 'Network error. Please check your connection.' 
        };
      } else {
        throw { 
          success: false, 
          message: error.message || 'Login failed. Please try again.' 
        };
      }
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error.response.data;
      } else {
        throw { 
          success: false, 
          message: 'Failed to fetch profile.' 
        };
      }
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// ============================================
// ADDRESS SERVICE ✅ NEW
// ============================================
export const addressService = {
  getAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  addAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  }
};

// ============================================
// RESTAURANT SERVICE
// ============================================
export const restaurantService = {
  getRestaurants: async (params = {}) => {
    try {
      const response = await api.get('/restaurants', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  getRestaurantById: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant by ID:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  searchRestaurants: async (query, limit = 20) => {
    try {
      if (!query || !query.trim()) {
        return { success: true, data: [], count: 0 };
      }

      const response = await api.get(`/restaurants/search/${encodeURIComponent(query.trim())}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching restaurants:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  searchRestaurantsByMenu: async (query, limit = 20) => {
    try {
      if (!query || !query.trim()) {
        return { success: true, data: [], count: 0 };
      }

      const response = await api.get(`/restaurants/search-menu/${encodeURIComponent(query.trim())}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching restaurants by menu:', error);
      try {
        return await this.searchRestaurants(query, limit);
      } catch (fallbackError) {
        throw error.response?.data || { success: false, message: error.message };
      }
    }
  },

  searchByCuisine: async (cuisine, limit = 20) => {
    try {
      const response = await api.get(`/restaurants/by-cuisine/${encodeURIComponent(cuisine)}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching by cuisine:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  searchByArea: async (area, limit = 20) => {
    try {
      const response = await api.get(`/restaurants/by-area/${encodeURIComponent(area)}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching by area:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  advancedSearch: async (searchParams) => {
    try {
      const response = await api.post('/restaurants/advanced-search', searchParams);
      return response.data;
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  searchByCategory: async (categoryName, options = {}) => {
    const { limit = 20, area, cuisine } = options;
    
    try {
      let results = await restaurantService.searchRestaurantsByMenu(categoryName, limit);
      
      if (results.success && results.data && results.data.length > 0) {
        return results;
      }

      results = await restaurantService.searchRestaurants(categoryName, limit);
      
      if (results.success && results.data && results.data.length > 0) {
        return results;
      }

      const partialTerm = categoryName.split(' ')[0];
      if (partialTerm !== categoryName) {
        results = await restaurantService.searchRestaurants(partialTerm, limit);
        
        if (results.success && results.data && results.data.length > 0) {
          return results;
        }
      }

      const cuisineMapping = {
        'pizza': 'italian',
        'pasta': 'italian', 
        'chinese': 'chinese',
        'biryani': 'indian',
        'dosa': 'south indian',
        'dhokla': 'gujarati',
        'burger': 'fast food',
        'noodles': 'chinese'
      };

      const relatedCuisine = cuisineMapping[categoryName.toLowerCase()];
      if (relatedCuisine) {
        results = await restaurantService.searchByCuisine(relatedCuisine, limit);
        
        if (results.success && results.data && results.data.length > 0) {
          return results;
        }
      }

      return {
        success: true,
        data: [],
        count: 0,
        message: `No restaurants found serving ${categoryName}`
      };

    } catch (error) {
      console.error('Error in category search:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  getCuisines: async () => {
    try {
      const response = await api.get('/restaurants/cuisines');
      return response.data;
    } catch (error) {
      console.error('Error fetching cuisines:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  getAreas: async () => {
    try {
      const response = await api.get('/restaurants/areas');
      return response.data;
    } catch (error) {
      console.error('Error fetching areas:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  getRestaurantMenu: async (id) => {
    try {
      const response = await api.get(`/restaurants/${id}/menu`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant menu:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  enhancedSearch: async (searchTerm, options = {}) => {
    const { limit = 20, retryOnFailure = true } = options;
    
    const searchStrategies = [
      () => restaurantService.searchRestaurantsByMenu(searchTerm, limit),
      () => restaurantService.searchRestaurants(searchTerm, limit),
      () => {
        const firstWord = searchTerm.split(' ')[0];
        return firstWord !== searchTerm 
          ? restaurantService.searchRestaurants(firstWord, limit)
          : Promise.resolve({ success: false });
      },
      () => {
        const singular = searchTerm.replace(/s$/, '');
        return singular !== searchTerm
          ? restaurantService.searchRestaurants(singular, limit)
          : Promise.resolve({ success: false });
      }
    ];

    for (const strategy of searchStrategies) {
      try {
        const result = await strategy();
        if (result.success && result.data && result.data.length > 0) {
          return result;
        }
      } catch (error) {
        console.warn('Search strategy failed:', error);
        if (!retryOnFailure) throw error;
      }
    }

    return {
      success: true,
      data: [],
      count: 0,
      message: `No restaurants found for "${searchTerm}"`
    };
  }
};

// ============================================
// ORDER SERVICE
// ============================================
export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  },

  validateCoupon: async (couponCode, subtotal) => {
    try {
      const response = await api.post('/orders/validate-coupon', { couponCode, subtotal });
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error.response?.data || { success: false, message: error.message };
    }
  }
};

export default api;
