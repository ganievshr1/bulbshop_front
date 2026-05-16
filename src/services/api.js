const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api/v1';
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost/api/v1';

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

const fetchWithRetry = async (url, options, maxRetries = 2, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Попытка ${i + 1}/${maxRetries + 1} не удалась:`, error.message);
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

const checkProductExists = async (id) => {
  const token = getAdminToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 404) return false;
    if (response.ok) return true;
    return null;
  } catch (error) {
    console.error('Check product exists error:', error);
    return null;
  }
};

// ==================== АУТЕНТИФИКАЦИЯ ====================

let adminToken = localStorage.getItem('admin_token');

export const setAdminToken = (token) => {
  adminToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
};

export const getAdminToken = () => {
  return adminToken || localStorage.getItem('admin_token');
};

export const adminLogin = async (login, password) => {
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      setAdminToken(data.token);
      localStorage.setItem('admin_data', JSON.stringify(data.admin));
    }
    
    return data;
  } catch (error) {
    console.error('API Error (adminLogin):', error);
    return { success: false, error: error.message };
  }
};

export const adminLogout = async () => {
  const token = getAdminToken();
  if (token) {
    try {
      await fetchWithRetry(`${ADMIN_API_URL}/admin/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  setAdminToken(null);
  localStorage.removeItem('admin_data');
};

export const getCurrentAdmin = async () => {
  const token = getAdminToken();
  if (!token) return { success: false, data: null };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Не авторизован');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (getCurrentAdmin):', error);
    return { success: false, error: error.message, data: null };
  }
};

export const isAuthenticated = () => {
  return !!getAdminToken();
};

// ==================== АДМИН: СМЕНА ПАРОЛЯ ====================

export const changeAdminPassword = async (currentPassword, newPassword, confirmPassword) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован' };
  
  // Валидация на клиенте
  if (!currentPassword || currentPassword.length === 0) {
    return { success: false, error: 'Введите текущий пароль' };
  }
  
  if (!newPassword || newPassword.length < 4) {
    return { success: false, error: 'Новый пароль должен содержать минимум 4 символа' };
  }
  
  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Новый пароль и подтверждение не совпадают' };
  }
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword,
        confirm_password: confirmPassword
      }),
    });
    
    let data;
    const responseText = await response.text();
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { detail: responseText || 'Неизвестная ошибка' };
    }
    
    if (!response.ok) {
      let errorMessage = 'Ошибка смены пароля';
      
      if (data && typeof data === 'object') {
        if (data.detail && typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (data.error && typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.message && typeof data.message === 'string') {
          errorMessage = data.message;
        }
      }
      
      return { success: false, error: errorMessage };
    }
    
    const message = data && data.message && typeof data.message === 'string' 
      ? data.message 
      : 'Пароль успешно изменен';
    
    return { success: true, message };
    
  } catch (error) {
    console.error('API Error (changeAdminPassword):', error);
    return { success: false, error: 'Сетевая ошибка: ' + error.message };
  }
};

// ==================== ТОВАРЫ (публичные) ====================

export const getProducts = async (filters = {}) => {
  try {
    let url = `${API_URL}/products?page=1&limit=100`;
    if (filters.socket_type) url += `&socket_type=${filters.socket_type}`;
    if (filters.min_price) url += `&min_price=${filters.min_price}`;
    if (filters.max_price) url += `&max_price=${filters.max_price}`;

    const response = await fetchWithRetry(url);
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    const data = await response.json();
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('API Error (getProducts):', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetchWithRetry(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error('Товар не найден');
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('API Error (getProductById):', error);
    return { success: false, error: error.message, data: null };
  }
};

// ==================== КАТЕГОРИИ ====================

export const getCategories = async () => {
  try {
    const response = await fetchWithRetry(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Ошибка загрузки категорий');
    const data = await response.json();
    return { success: true, data: Array.isArray(data) ? data : (data.data || []) };
  } catch (error) {
    console.error('API Error (getCategories):', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await fetchWithRetry(`${API_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Категория не найдена');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (getCategoryById):', error);
    return { success: false, error: error.message, data: null };
  }
};

// ==================== АДМИН: ТОВАРЫ ====================

export const getAdminProducts = async (filters = {}) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: [], pagination: null };
  
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    
    let url = `${ADMIN_API_URL}/admin/products?page=${page}&limit=${limit}`;
    if (filters.category_id) url += `&category_id=${filters.category_id}`;
    if (filters.min_price) url += `&min_price=${filters.min_price}`;
    if (filters.max_price) url += `&max_price=${filters.max_price}`;
    if (filters.socket_type) url += `&socket_type=${filters.socket_type}`;
    if (filters.is_active !== undefined) url += `&is_active=${filters.is_active}`;

    const response = await fetchWithRetry(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Ошибка загрузки товаров');
    }
    
    const data = await response.json();
    
    return { 
      success: true, 
      data: data.data || [], 
      pagination: data.pagination || { page, limit, total: 0, total_pages: 0 }
    };
  } catch (error) {
    console.error('API Error (getAdminProducts):', error);
    return { success: false, error: error.message, data: [], pagination: null };
  }
};

export const createProduct = async (productData) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.detail || 'Ошибка создания товара', data: null };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API Error (createProduct):', error);
    return { success: false, error: error.message, data: null };
  }
};

export const updateProduct = async (id, productData) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.detail || 'Ошибка обновления товара', data: null };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('API Error (updateProduct):', error);
    return { success: false, error: error.message, data: null };
  }
};

export const deleteProduct = async (id) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован' };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 204) {
      return { success: true };
    }
    
    if (response.ok) {
      try {
        const data = await response.json();
        return { success: true, data };
      } catch {
        return { success: true };
      }
    }
    
    const errorData = await response.json().catch(() => ({}));
    return { success: false, error: errorData.detail || 'Ошибка удаления товара' };
    
  } catch (error) {
    console.error('API Error (deleteProduct):', error);
    
    const exists = await checkProductExists(id);
    
    if (exists === false) {
      return { success: true };
    }
    
    if (exists === true) {
      return { success: false, error: 'Сетевая ошибка, но товар не удалён. Попробуйте снова.' };
    }
    
    return { success: false, error: error.message };
  }
};

export const updateProductStock = async (id, stock) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/products/${id}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ stock }),
    });
    if (!response.ok) throw new Error('Ошибка обновления остатка');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (updateProductStock):', error);
    return { success: false, error: error.message, data: null };
  }
};

// ==================== АДМИН: КАТЕГОРИИ ====================

export const createCategory = async (categoryData) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetchWithRetry(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Ошибка создания категории');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (createCategory):', error);
    return { success: false, error: error.message, data: null };
  }
};

export const updateCategory = async (id, categoryData) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetchWithRetry(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Ошибка обновления категории');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (updateCategory):', error);
    return { success: false, error: error.message, data: null };
  }
};

// ==================== АДМИН: ЗАКАЗЫ ====================

export const getAdminOrders = async (filters = {}) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: [] };
  
  try {
    let url = `${ADMIN_API_URL}/admin/orders?page=${filters.page || 1}&limit=${filters.limit || 100}`;
    if (filters.status) url += `&status=${filters.status}`;

    const response = await fetchWithRetry(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    const data = await response.json();
    return { success: true, data: data.data || [], pagination: data.pagination };
  } catch (error) {
    console.error('API Error (getAdminOrders):', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getAdminOrderById = async (id) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Заказ не найден');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (getAdminOrderById):', error);
    return { success: false, error: error.message, data: null };
  }
};

export const updateOrderStatus = async (id, status) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Ошибка обновления статуса');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (updateOrderStatus):', error);
    return { success: false, error: error.message, data: null };
  }
};

// ==================== ПУБЛИЧНЫЕ ЗАКАЗЫ ====================

export const createOrder = async (orderData) => {
  try {
    console.log('📦 Sending order:', orderData);
    
    const response = await fetchWithRetry(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    console.log('📡 Response status:', response.status);
    
    let data;
    const responseText = await response.text();
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON:', responseText);
      throw new Error('Некорректный ответ сервера');
    }
    
    if (!response.ok) {
      const errorMsg = data.detail || data.message || 'Ошибка создания заказа';
      throw new Error(errorMsg);
    }
    
    if (data.success && data.data) {
      return { success: true, data: data.data };
    } else if (data.id || data.order_number) {
      return { success: true, data: data };
    }
    
    return { success: true, data: data };
    
  } catch (error) {
    console.error('API Error (createOrder):', error);
    return { success: false, error: error.message, data: null };
  }
};

// ==================== ПУБЛИЧНЫЕ ЗАКАЗЫ (получение) ====================

export const getOrders = async () => {
  try {
    const response = await fetchWithRetry(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    const data = await response.json();
    return { success: true, data: data.data || data || [] };
  } catch (error) {
    console.error('API Error (getOrders):', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ==================== АУДИТ ====================

export const getAuditLogs = async (filters = {}) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: [] };
  
  try {
    let url = `${ADMIN_API_URL}/admin/logs?page=${filters.page || 1}&limit=${filters.limit || 50}`;
    if (filters.admin_id) url += `&admin_id=${filters.admin_id}`;
    if (filters.action) url += `&action=${filters.action}`;
    if (filters.entity_type) url += `&entity_type=${filters.entity_type}`;
    if (filters.entity_id) url += `&entity_id=${filters.entity_id}`;

    const response = await fetchWithRetry(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Ошибка загрузки логов');
    const data = await response.json();
    return { success: true, data: data.data || [], pagination: data.pagination };
  } catch (error) {
    console.error('API Error (getAuditLogs):', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const getEntityHistory = async (entityType, entityId) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: [] };
  
  try {
    const response = await fetchWithRetry(`${ADMIN_API_URL}/admin/logs/entity/${entityType}/${entityId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Ошибка загрузки истории');
    const data = await response.json();
    return { success: true, data: data.data || [] };
  } catch (error) {
    console.error('API Error (getEntityHistory):', error);
    return { success: false, error: error.message, data: [] };
  }
};