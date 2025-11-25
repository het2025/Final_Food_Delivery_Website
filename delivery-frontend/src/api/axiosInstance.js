import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api/delivery';

export const deliveryAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
deliveryAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('deliveryToken');
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
deliveryAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('deliveryToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  register: (data) => deliveryAPI.post('/auth/register', data),
  login: (data) => deliveryAPI.post('/auth/login', data),
  getProfile: () => deliveryAPI.get('/auth/me'),
  logout: () => deliveryAPI.post('/auth/logout')
};

export const ordersAPI = {
  getAvailable: () => deliveryAPI.get('/orders/available'),
  getCurrent: () => deliveryAPI.get('/orders/current'),
  getHistory: (page = 1) => deliveryAPI.get(`/orders/history?page=${page}`),
  accept: (orderId) => deliveryAPI.post(`/orders/${orderId}/accept`),
  reject: (orderId, reason) => deliveryAPI.post(`/orders/${orderId}/reject`, { reason }),
  pickup: (orderId) => deliveryAPI.post(`/orders/${orderId}/pickup`),
  startTransit: (orderId) => deliveryAPI.post(`/orders/${orderId}/transit`),
  complete: (orderId, otp) => deliveryAPI.post(`/orders/${orderId}/complete`, { otp }),
  updateLocation: (latitude, longitude) => deliveryAPI.put('/orders/location', { latitude, longitude })
};

export const profileAPI = {
  update: (data) => deliveryAPI.put('/profile', data),
  toggleOnline: () => deliveryAPI.put('/profile/online'),
  toggleAvailability: () => deliveryAPI.put('/profile/availability'),
  getEarnings: () => deliveryAPI.get('/profile/earnings')
};
