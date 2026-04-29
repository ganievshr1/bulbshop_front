// Используем прямой порт Product Service (8081)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';
const ORDER_API_URL = 'http://localhost:8082/api/v1';
// const ADMIN_API_URL = 'http://localhost:8083/api/v1'; // для админки

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

// === СОЗДАНИЕ ТОВАРА ===
export const createProduct = async (productData) => {
  try {
    const payload = {
      name: productData.name,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
      socket_type: productData.socket_type || 'E27',
      power_watt: productData.power_watt ? parseInt(productData.power_watt) : null,
      color_temp_k: productData.color_temp_k ? parseInt(productData.color_temp_k) : null,
      category_id: productData.category_id || 1,
      description: productData.description || '',
      lumen: productData.lumen ? parseInt(productData.lumen) : null,
      lifespan_hours: productData.lifespan_hours ? parseInt(productData.lifespan_hours) : null,
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
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Ошибка обновления товара');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
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

export const updateProductStock = async (id, stock) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
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
    console.error('API Error:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await fetch(`${ORDER_API_URL}/orders?limit=100`);
    if (!response.ok) throw new Error('Ошибка загрузки заказов');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(`${ORDER_API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, changed_by: 'admin' }),
    });
    if (!response.ok) throw new Error('Ошибка обновления статуса');
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};