const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api/v1';
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'http://localhost/api/v1';

// ==================== АУТЕНТИФИКАЦИЯ ====================

// Хранение токена
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

// Админ логин
export const adminLogin = async (login, password) => {
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/login`, {
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

// Админ логаут
export const adminLogout = async () => {
  const token = getAdminToken();
  if (token) {
    try {
      await fetch(`${ADMIN_API_URL}/admin/logout`, {
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

// Получить текущего админа
export const getCurrentAdmin = async () => {
  const token = getAdminToken();
  if (!token) return { success: false, data: null };
  
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/me`, {
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

// Проверка авторизации
export const isAuthenticated = () => {
  return !!getAdminToken();
};

// ==================== АДМИН: СМЕНА ПАРОЛЯ ====================

export const changeAdminPassword = async (currentPassword, newPassword) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован' };
  
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword 
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.detail || 'Ошибка смены пароля' };
    }
    
    return { success: true, message: data.message };
  } catch (error) {
    console.error('API Error (changeAdminPassword):', error);
    return { success: false, error: error.message };
  }
};

// ==================== ТОВАРЫ (публичные) ====================

export const getProducts = async (filters = {}) => {
  try {
    let url = `${API_URL}/products?page=1&limit=100`;
    if (filters.socket_type) url += `&socket_type=${filters.socket_type}`;
    if (filters.min_price) url += `&min_price=${filters.min_price}`;
    if (filters.max_price) url += `&max_price=${filters.max_price}`;

    const response = await fetch(url);
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
    const response = await fetch(`${API_URL}/products/${id}`);
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
    const response = await fetch(`${API_URL}/categories`);
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
    const response = await fetch(`${API_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Категория не найдена');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (getCategoryById):', error);
    return { success: false, error: error.message, data: null };
  }
};

// ==================== АДМИН: ТОВАРЫ (через Admin Service) ====================

// Получить все товары (включая неактивные) - админская версия
export const getAdminProducts = async (filters = {}) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: [] };
  
  try {
    let url = `${ADMIN_API_URL}/admin/products?page=${filters.page || 1}&limit=${filters.limit || 100}`;
    if (filters.category_id) url += `&category_id=${filters.category_id}`;
    if (filters.min_price) url += `&min_price=${filters.min_price}`;
    if (filters.max_price) url += `&max_price=${filters.max_price}`;
    if (filters.socket_type) url += `&socket_type=${filters.socket_type}`;
    if (filters.is_active !== undefined) url += `&is_active=${filters.is_active}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    const data = await response.json();
    return { success: true, data: data.data || [], pagination: data.pagination };
  } catch (error) {
    console.error('API Error (getAdminProducts):', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Создать товар (админ)
export const createProduct = async (productData) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Ошибка создания товара');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (createProduct):', error);
    return { success: false, error: error.message, data: null };
  }
};

// Обновить товар (админ)
export const updateProduct = async (id, productData) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Ошибка обновления товара');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (updateProduct):', error);
    return { success: false, error: error.message, data: null };
  }
};

// Удалить товар (админ)
export const deleteProduct = async (id) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован' };
  
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Ошибка удаления товара');
    return { success: true };
  } catch (error) {
    console.error('API Error (deleteProduct):', error);
    return { success: false, error: error.message };
  }
};

// Обновить остаток товара (админ)
export const updateProductStock = async (id, stock) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: null };
  
  try {
    const response = await fetch(`${ADMIN_API_URL}/admin/products/${id}/stock`, {
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
    const response = await fetch(`${API_URL}/categories`, {
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
    const response = await fetch(`${API_URL}/categories/${id}`, {
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

// ==================== АДМИН: ЗАКАЗЫ (через Admin Service) ====================

export const getAdminOrders = async (filters = {}) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: [] };
  
  try {
    let url = `${ADMIN_API_URL}/admin/orders?page=${filters.page || 1}&limit=${filters.limit || 100}`;
    if (filters.status) url += `&status=${filters.status}`;

    const response = await fetch(url, {
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
    const response = await fetch(`${ADMIN_API_URL}/admin/orders/${id}`, {
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
    const response = await fetch(`${ADMIN_API_URL}/admin/orders/${id}/status`, {
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

// ==================== ПУБЛИЧНЫЕ ЗАКАЗЫ (для клиентов) ====================

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Ошибка создания заказа');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error (createOrder):', error);
    return { success: false, error: error.message, data: null };
  }
};

export const getOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    const data = await response.json();
    return { success: true, data: data.data || data || [] };
  } catch (error) {
    console.error('API Error (getOrders):', error);
    return { success: false, error: error.message, data: [] };
  }
};

// ==================== АУДИТ (только для супер-админов) ====================

export const getAuditLogs = async (filters = {}) => {
  const token = getAdminToken();
  if (!token) return { success: false, error: 'Не авторизован', data: [] };
  
  try {
    let url = `${ADMIN_API_URL}/admin/logs?page=${filters.page || 1}&limit=${filters.limit || 50}`;
    if (filters.admin_id) url += `&admin_id=${filters.admin_id}`;
    if (filters.action) url += `&action=${filters.action}`;
    if (filters.entity_type) url += `&entity_type=${filters.entity_type}`;
    if (filters.entity_id) url += `&entity_id=${filters.entity_id}`;

    const response = await fetch(url, {
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
    const response = await fetch(`${ADMIN_API_URL}/admin/logs/entity/${entityType}/${entityId}`, {
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