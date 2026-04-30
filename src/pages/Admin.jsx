import React, { useState, useEffect } from 'react';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, updateProductStock,
  getOrders, updateOrderStatus, getCategories, createCategory, getCategoryById
} from '../services/api';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');  // ← здесь был пропущен знак =
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    socket_type: '',
    power_watt: '',
    color_temp_k: '',
    lumen: '',
    lifespan_hours: '',
    category_id: 1,
    image_url: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = () => {
    if (activeTab === 'products') {
      loadProducts();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      alert('Введите название категории');
      return;
    }

    try {
      await createCategory({
        name: categoryFormData.name,
        description: categoryFormData.description || null
      });
      alert('Категория успешно добавлена');
      setCategoryFormData({ name: '', description: '' });
      setShowCategoryForm(false);
      await loadCategories();
    } catch (error) {
      console.error('Ошибка создания категории:', error);
      alert('Ошибка при создании категории');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Пожалуйста, заполните обязательные поля (название, цена, остаток)');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      socket_type: formData.socket_type || null,
      power_watt: formData.power_watt ? parseInt(formData.power_watt) : null,
      color_temp_k: formData.color_temp_k ? parseInt(formData.color_temp_k) : null,
      lumen: formData.lumen ? parseInt(formData.lumen) : null,
      lifespan_hours: formData.lifespan_hours ? parseInt(formData.lifespan_hours) : null,
      category_id: parseInt(formData.category_id),
      image_url: formData.image_url || null
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        alert('Товар успешно обновлен');
      } else {
        await createProduct(productData);
        alert('Товар успешно добавлен');
      }
      
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      alert('Ошибка при сохранении товара');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock || '',
      socket_type: product.socket_type || '',
      power_watt: product.power_watt || '',
      color_temp_k: product.color_temp_k || '',
      lumen: product.lumen || '',
      lifespan_hours: product.lifespan_hours || '',
      category_id: product.category_id || categories[0]?.id || 1,
      image_url: product.image_url || ''
    });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await deleteProduct(id);
        alert('Товар удален');
        loadProducts();
      } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Ошибка при удалении товара');
      }
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      await updateProductStock(id, { stock: parseInt(newStock) });
      alert('Остаток обновлен');
      loadProducts();
    } catch (error) {
      console.error('Ошибка обновления остатка:', error);
      alert('Ошибка при обновлении остатка');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      alert('Статус заказа обновлен');
      loadOrders();
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      socket_type: '',
      power_watt: '',
      color_temp_k: '',
      lumen: '',
      lifespan_hours: '',
      category_id: categories[0]?.id || 1,
      image_url: ''
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'confirmed': return 'status-confirmed';
      case 'paid': return 'status-paid';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'confirmed': return 'Подтвержден';
      case 'paid': return 'Оплачен';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>👨‍💼 Панель администратора</h1>
        <button className="logout-btn" onClick={() => {/* Логика выхода */}}>
          Выйти
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => { setActiveTab('products'); setCurrentPage(1); }}
        >
          📦 Товары
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => { setActiveTab('orders'); setCurrentPage(1); }}
        >
          📋 Заказы
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="products-tab">
          {/* Форма добавления категории */}
          <div className="category-section">
            <div className="category-header">
              <h3>📁 Управление категориями</h3>
              <button 
                className="add-category-btn"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
              >
                {showCategoryForm ? '✖ Отмена' : '+ Добавить категорию'}
              </button>
            </div>
            
            {showCategoryForm && (
              <form className="category-form" onSubmit={handleCreateCategory}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Название категории *</label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      placeholder="Например: LED лампочки"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Описание</label>
                    <input
                      type="text"
                      name="description"
                      value={categoryFormData.description}
                      onChange={handleCategoryInputChange}
                      placeholder="Краткое описание категории"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="submit-category-btn">
                      ✅ Создать категорию
                    </button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Список существующих категорий */}
            <div className="categories-list">
              {categories.map(cat => (
                <span key={cat.id} className="category-tag">
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* Форма добавления/редактирования товара */}
          <div className="product-form-section">
            <h3>{editingProduct ? '✏️ Редактирование товара' : '➕ Добавление нового товара'}</h3>
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Название товара *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Например: LED E27 9W 4000K"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Описание</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Описание товара, характеристики, особенности..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Цена (₽) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="299"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Остаток на складе *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="85"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Тип цоколя</label>
                  <input
                    type="text"
                    name="socket_type"
                    value={formData.socket_type}
                    onChange={handleInputChange}
                    placeholder="E27, E14, GU10, G9, G4 или другой тип"
                  />
                </div>

                <div className="form-group">
                  <label>Категория</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Мощность (Вт)</label>
                  <input
                    type="number"
                    name="power_watt"
                    value={formData.power_watt}
                    onChange={handleInputChange}
                    placeholder="9"
                  />
                </div>

                <div className="form-group">
                  <label>Цветовая температура (K)</label>
                  <input
                    type="number"
                    name="color_temp_k"
                    value={formData.color_temp_k}
                    onChange={handleInputChange}
                    placeholder="4000"
                  />
                </div>

                <div className="form-group">
                  <label>Световой поток (люмен)</label>
                  <input
                    type="number"
                    name="lumen"
                    value={formData.lumen}
                    onChange={handleInputChange}
                    placeholder="1055"
                  />
                </div>

                <div className="form-group">
                  <label>Срок службы (часов)</label>
                  <input
                    type="number"
                    name="lifespan_hours"
                    value={formData.lifespan_hours}
                    onChange={handleInputChange}
                    placeholder="25000"
                  />
                </div>

                <div className="form-group full-width">
                  <label>URL изображения</label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  {editingProduct ? '💾 Сохранить изменения' : '➕ Добавить товар'}
                </button>
                {editingProduct && (
                  <button type="button" className="cancel-btn" onClick={resetForm}>
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Список товаров */}
          <div className="products-list-section">
            <h3>📋 Список товаров</h3>
            {loading ? (
              <div className="loading">Загрузка...</div>
            ) : (
              <>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Цена</th>
                      <th>Остаток</th>
                      <th>Категория</th>
                      <th>Цоколь</th>
                      <th>Мощность</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.price} ₽</td>
                        <td>
                          <input
                            type="number"
                            value={product.stock}
                            onChange={(e) => handleUpdateStock(product.id, e.target.value)}
                            className="stock-input"
                            style={{ width: '80px' }}
                          />
                        </td>
                        <td>{product.category_name || '-'}</td>
                        <td>{product.socket_type || '-'}</td>
                        <td>{product.power_watt ? `${product.power_watt} Вт` : '-'}</td>
                        <td>
                          <button className="edit-btn" onClick={() => handleEditProduct(product)}>
                            ✏️
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteProduct(product.id)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      ← Назад
                    </button>
                    <span>Страница {currentPage} из {totalPages}</span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Вперед →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-tab">
          <h3>📋 Заказы</h3>
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">Заказов пока нет</div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>№ заказа</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.order_number}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.customer_phone}</td>
                    <td>{order.total_amount} ₽</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="new">Новый</option>
                        <option value="confirmed">Подтвержден</option>
                        <option value="paid">Оплачен</option>
                        <option value="shipped">Отправлен</option>
                        <option value="delivered">Доставлен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;