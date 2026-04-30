// Используем прямой порт Product Service (8081)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';
const ORDER_API_URL = 'http://localhost:8082/api/v1';

// === ТОВАРЫ ===
export const getProducts = async (filters = {}) => {
  try {
    let url = `${API_URL}/products?page=1&limit=100`;
    if (filters.socket_type) url += `&socket_type=${filters.socket_type}`;
    if (filters.min_price) url += `&min_price=${filters.min_price}`;
    if (filters.max_price) url += `&max_price=${filters.max_price}`;
    
    console.log('Fetching products from:', url);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка загрузки товаров');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error('Товар не найден');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

// === КАТЕГОРИИ ===
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error('Ошибка загрузки категорий');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Категория не найдена');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const payload = {
      name: categoryData.name,
      description: categoryData.description || null
    };
    
    console.log('POST to:', `${API_URL}/categories`);
    console.log('Payload:', payload);
    
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.detail || 'Ошибка создания категории');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error createCategory:', error);
    throw error;
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
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Ошибка удаления категории');
    return true;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// === СОЗДАНИЕ ТОВАРА ===
export const createProduct = async (productData) => {
  try {
    const payload = {
      name: productData.name,
      description: productData.description || null,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      socket_type: productData.socket_type || 'E27',
      power_watt: productData.power_watt ? parseInt(productData.power_watt) : null,
      color_temp_k: productData.color_temp_k ? parseInt(productData.color_temp_k) : null,
      lumen: productData.lumen ? parseInt(productData.lumen) : null,
      lifespan_hours: productData.lifespan_hours ? parseInt(productData.lifespan_hours) : null,
      category_id: parseInt(productData.category_id) || 1,
      image_url: productData.image_url || null
    };
    
    console.log('POST to:', `${API_URL}/products`);
    console.log('Payload:', payload);
    
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.detail || 'Ошибка создания товара');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error createProduct:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const payload = {};
    
    if (productData.name !== undefined) payload.name = productData.name;
    if (productData.description !== undefined) payload.description = productData.description;
    if (productData.price !== undefined) payload.price = parseFloat(productData.price);
    if (productData.stock !== undefined) payload.stock = parseInt(productData.stock);
    if (productData.socket_type !== undefined) payload.socket_type = productData.socket_type;
    if (productData.power_watt !== undefined) payload.power_watt = productData.power_watt ? parseInt(productData.power_watt) : null;
    if (productData.color_temp_k !== undefined) payload.color_temp_k = productData.color_temp_k ? parseInt(productData.color_temp_k) : null;
    if (productData.lumen !== undefined) payload.lumen = productData.lumen ? parseInt(productData.lumen) : null;
    if (productData.lifespan_hours !== undefined) payload.lifespan_hours = productData.lifespan_hours ? parseInt(productData.lifespan_hours) : null;
    if (productData.category_id !== undefined) payload.category_id = parseInt(productData.category_id);
    if (productData.image_url !== undefined) payload.image_url = productData.image_url;
    if (productData.is_active !== undefined) payload.is_active = productData.is_active;
    
    console.log('PUT to:', `${API_URL}/products/${id}`);
    console.log('Payload:', payload);
    
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.detail || 'Ошибка обновления товара');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error updateProduct:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Ошибка удаления товара');
    return true;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const updateProductStock = async (id, stockData) => {
  try {
    const stockValue = typeof stockData === 'object' ? stockData.stock : stockData;
    
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: parseInt(stockValue) }),
    });
    
    if (!response.ok) throw new Error('Ошибка обновления остатка');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// === ЗАКАЗЫ ===
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${ORDER_API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Ошибка создания заказа');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('API Error createOrder:', error);
    throw error;
  }
};

export const getOrders = async (page = 1, limit = 100, status = null) => {
  try {
    let url = `${ORDER_API_URL}/orders?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error getOrders:', error);
    return { success: true, data: [], pagination: { page: 1, limit: 100, total: 0, total_pages: 1 } };
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${ORDER_API_URL}/orders/${orderId}`);
    if (!response.ok) throw new Error('Заказ не найден');
    return await response.json();
  } catch (error) {
    console.error('API Error getOrderById:', error);
    return null;
  }
};

export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const payload = typeof statusData === 'object' 
      ? statusData 
      : { status: statusData, changed_by: 'admin' };
    
    const response = await fetch(`${ORDER_API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) throw new Error('Ошибка обновления статуса');
    return await response.json();
  } catch (error) {
    console.error('API Error updateOrderStatus:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId, comment = '') => {
  try {
    const response = await fetch(`${ORDER_API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    
    if (!response.ok) throw new Error('Ошибка отмены заказа');
    return await response.json();
  } catch (error) {
    console.error('API Error cancelOrder:', error);
    throw error;
  }
};

export const getOrderStatusHistory = async (orderId) => {
  try {
    const response = await fetch(`${ORDER_API_URL}/orders/${orderId}/status-history`);
    if (!response.ok) throw new Error('Ошибка загрузки истории');
    return await response.json();
  } catch (error) {
    console.error('API Error getOrderStatusHistory:', error);
    return [];
  }
};

// === ПОИСК И ФИЛЬТРАЦИЯ ===
export const searchProducts = async (query, page = 1, limit = 20) => {
  try {
    const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Ошибка поиска товаров');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error searchProducts:', error);
    return { success: true, data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 1 } };
  }
};

export const filterProducts = async (filters, page = 1, limit = 20) => {
  try {
    let url = `${API_URL}/products?page=${page}&limit=${limit}`;
    if (filters.category_id) url += `&category_id=${filters.category_id}`;
    if (filters.min_price) url += `&min_price=${filters.min_price}`;
    if (filters.max_price) url += `&max_price=${filters.max_price}`;
    if (filters.socket_type) url += `&socket_type=${filters.socket_type}`;
    if (filters.power_from) url += `&power_from=${filters.power_from}`;
    if (filters.power_to) url += `&power_to=${filters.power_to}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Ошибка фильтрации товаров');
    return await response.json();
  } catch (error) {
    console.error('API Error filterProducts:', error);
    return { success: true, data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 1 } };
  }
};