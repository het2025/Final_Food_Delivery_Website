// src/api/restaurantOwnerApi.js
// Central API helper for restaurant owner backend (cleaned - removed menu/additives/extras)

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Token key for restaurant owner
const getToken = () =>
  localStorage.getItem('restaurantOwnerToken') || localStorage.getItem('token') || '';

const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  let json;
  try {
    const text = await res.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    json = JSON.parse(text);
  } catch {
    if (res.status === 404) {
      throw new Error('Route not found (404) – check backend server.js mounting and routes');
    }
    throw new Error(`Invalid server response (${res.status}) – check backend logs`);
  }

  if (!res.ok) {
    console.warn(`API Error ${res.status}:`, res.url, json);
    if (res.status === 401 || res.status === 403) {
      logoutRestaurantOwner();
    }
    const errorMsg = json.message || `HTTP ${res.status}`;
    
    // Graceful handling for no-restaurant scenarios
    if (res.status === 400 && json.message?.includes('No restaurant')) {
      return json;
    }
    throw new Error(errorMsg);
  }

  if (!json.success && json.message?.includes('No restaurant')) {
    return json;
  }

  return json;
};

/* ========================================
   AUTH (login / register / profile)
   ======================================== */

// POST /api/auth/login
export const loginRestaurantOwner = async ({ email, password }) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const json = await handleResponse(res);

  // Store JWT
  if (json.data?.token) {
    localStorage.setItem('restaurantOwnerToken', json.data.token);
  }

  return json;
};

// POST /api/auth/register
export const registerRestaurantOwner = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return {
      success: result.success,
      token: result.token,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    console.error('Register API error:', error);
    return {
      success: false,
      message: error.message || 'Registration failed'
    };
  }
};

// GET /api/auth/me
export const getCurrentRestaurantOwner = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse(res);
};

// Logout helper
export const logoutRestaurantOwner = () => {
  localStorage.removeItem('restaurantOwnerToken');
  localStorage.removeItem('token');
};

// PUT /api/auth/profile
export const updateRestaurantOwnerProfile = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// PUT /api/auth/password
export const updateRestaurantOwnerPassword = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

/* ========================================
   ORDERS
   ======================================== */

// GET /api/orders
export const getRestaurantOwnerOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse(res);
};

// GET /api/orders/:id
export const getRestaurantOwnerOrderById = async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse(res);
};

// PUT /api/orders/:id/status
export const updateRestaurantOwnerOrderStatus = async (orderId, status) => {
  try {
    console.log('🔄 API call: Update order status', { orderId, status });

    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status })
    });

    const data = await handleResponse(res);
    console.log('✅ API response:', data);
    return data;
  } catch (error) {
    console.error('❌ API error:', error.message);
    throw { success: false, message: error.message };
  }
};

/* ========================================
   DASHBOARD
   ======================================== */

// GET /api/dashboard/stats
export const getDashboardStats = async () => {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse(res);
};

// GET /api/menu
export const getMenu = async () => {
  const res = await fetch(`${API_BASE_URL}/menu`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse(res);
};

// POST /api/menu
export const addMenuItem = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// DELETE /api/menu/:itemId
export const deleteMenuItem = async (itemId) => {
  const res = await fetch(`${API_BASE_URL}/menu/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse(res);
};

// GET /api/menu/categories
export const getMenuCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/menu/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('🔵 API getMenuCategories raw response:', data);
    
    return data;
  } catch (error) {
    console.error('❌ API getMenuCategories error:', error);
    throw error;
  }
};

// POST /api/menu/categories
export const createMenuCategory = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/menu/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// GET /api/menu/items
export const getMenuItems = async (categoryId) => {
  const query = categoryId ? `?categoryId=${categoryId}` : '';
  const res = await fetch(`${API_BASE_URL}/menu/items${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse(res);
};

// POST /api/menu/items
export const createMenuItem = async (payload) => {
  const res = await fetch(`${API_BASE_URL}/menu/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};

// PUT /api/menu/items/:id
export const updateMenuItem = async (itemId, payload) => {
  const res = await fetch(`${API_BASE_URL}/menu/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
};


/* ========================================
   EXPORTS SUMMARY
   ======================================== */

// Auth: loginRestaurantOwner, registerRestaurantOwner, getCurrentRestaurantOwner, 
//       logoutRestaurantOwner, updateRestaurantOwnerProfile, updateRestaurantOwnerPassword
// Orders: getRestaurantOwnerOrders, getRestaurantOwnerOrderById, updateRestaurantOwnerOrderStatus
// Dashboard: getDashboardStats
