const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';
const ORDER_API_URL = 'http://localhost:8082/api/v1';

// ==================== ТОВАРЫ ====================

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
    // Категории возвращаются как массив напрямую
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

export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

// ==================== АДМИН: ТОВАРЫ ====================

export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

export const updateProduct = async (id, productData) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Ошибка удаления товара');
    return { success: true };
  } catch (error) {
    console.error('API Error (deleteProduct):', error);
    return { success: false, error: error.message };
  }
};

export const updateProductStock = async (id, stock) => {
  try {
    // В бэкенде используется PUT /products/{id}/stock
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

// ==================== ЗАКАЗЫ ====================

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${ORDER_API_URL}/orders`, {
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
    const response = await fetch(`${ORDER_API_URL}/orders`);
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    const data = await response.json();
    return { success: true, data: data.data || data || [] };
  } catch (error) {
    console.error('API Error (getOrders):', error);
    return { success: false, error: error.message, data: [] };
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    // В бэкенде используется PUT /orders/{id}/status
    const response = await fetch(`${ORDER_API_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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