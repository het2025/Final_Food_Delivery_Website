import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/admin';

export const adminAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const dashboardAPI = {
  getStats: () => adminAPI.get('/dashboard/stats'),
  getActivity: (limit = 20) => adminAPI.get(`/dashboard/activity?limit=${limit}`)
};

export const usersAPI = {
  getAll: (page = 1, limit = 20, search = '') =>
    adminAPI.get(`/users?page=${page}&limit=${limit}&search=${search}`),
  getById: (id) => adminAPI.get(`/users/${id}`),
  updateStatus: (id, isActive) => adminAPI.put(`/users/${id}/status`, { isActive }),
  delete: (id) => adminAPI.delete(`/users/${id}`)
};

export const restaurantsAPI = {
  getAll: (page = 1, limit = 20, search = '', status = '') =>
    adminAPI.get(`/restaurants?page=${page}&limit=${limit}&search=${search}&status=${status}`),
  getPending: () => adminAPI.get('/restaurants/pending'),
  approve: (id) => adminAPI.post(`/restaurants/${id}/approve`),
  reject: (id, reason) => adminAPI.post(`/restaurants/${id}/reject`, { reason }),
  updateStatus: (id, status) => adminAPI.put(`/restaurants/${id}/status`, { status }),
  delete: (id) => adminAPI.delete(`/restaurants/${id}`)
};

export const ordersAPI = {
  getAll: (page = 1, limit = 20, status = '', search = '') =>
    adminAPI.get(`/orders?page=${page}&limit=${limit}&status=${status}&search=${search}`),
  getByRestaurant: () => adminAPI.get('/orders/by-restaurant'),
  getRestaurantOrders: (restaurantId, page = 1, limit = 20, status = '') =>
    adminAPI.get(`/orders/restaurant/${restaurantId}?page=${page}&limit=${limit}&status=${status}`),
  getById: (id) => adminAPI.get(`/orders/${id}`),
  updateStatus: (id, status, notes = '') =>
    adminAPI.put(`/orders/${id}/status`, { status, notes }),
  cancel: (id, reason) => adminAPI.put(`/orders/${id}/cancel`, { reason }),
  getStats: () => adminAPI.get('/orders/stats')
};

// ✅ NEW: Analytics API
export const analyticsAPI = {
  getOverview: () => adminAPI.get('/analytics/overview'),
  getOrderStatus: () => adminAPI.get('/analytics/order-status'),
  getOrdersTrend: (months = 6) => adminAPI.get(`/analytics/orders-trend?months=${months}`),
  getOrdersByDay: () => adminAPI.get('/analytics/orders-by-day'),
  getPeakHours: () => adminAPI.get('/analytics/peak-hours'),
  getTopRestaurants: (limit = 10) => adminAPI.get(`/analytics/top-restaurants?limit=${limit}`),
  getPaymentSplit: () => adminAPI.get('/analytics/payment-split')
};

