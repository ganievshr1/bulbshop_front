import React, { useState, useEffect } from 'react';
import { 
  getProducts, createProduct, updateProduct, deleteProduct, updateProductStock,
  getOrders, updateOrderStatus, getCategories 
} from '../services/api';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    socket_type: 'E27',
    power_watt: '',
    color_temp_k: '',
    category_id: 1,
    description: ''
  });

  useEffect(() => {
    loadCategories();
    loadData();
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      if (data.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'products') {
      const data = await getProducts();
      setProducts(data);
    } else {
      const data = await getOrders();
      setOrders(data);
    }
    setLoading(false);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      alert('Пожалуйста, заполните название, цену и остаток');
      return;
    }
    
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        alert('✅ Товар обновлен!');
      } else {
        await createProduct(formData);
        alert('✅ Товар создан!');
      }
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        stock: '',
        socket_type: 'E27',
        power_watt: '',
        color_temp_k: '',
        category_id: categories[0]?.id || 1,
        description: ''
      });
      loadData();
    } catch (err) {
      alert(`❌ Ошибка: ${err.message}`);
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Удалить товар?')) {
      try {
        await deleteProduct(id);
        alert('✅ Товар удален');
        loadData();
      } catch (err) {
        alert('❌ Ошибка удаления');
      }
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    try {
      await updateProductStock(id, newStock);
      loadData();
    } catch (err) {
      alert('❌ Ошибка обновления остатка');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      alert('✅ Статус обновлен');
      loadData();
    } catch (err) {
      alert('❌ Ошибка обновления статуса');
    }
  };

  const getStatusName = (status) => {
    const names = {
      'new': 'Новый',
      'confirmed': 'Подтвержден',
      'paid': 'Оплачен',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'cancelled': 'Отменен'
    };
    return names[status] || status;
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      stock: product.stock || '',
      socket_type: product.socket_type || 'E27',
      power_watt: product.power_watt || '',
      color_temp_k: product.color_temp_k || '',
      category_id: product.category_id || 1,
      description: product.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      stock: '',
      socket_type: 'E27',
      power_watt: '',
      color_temp_k: '',
      category_id: categories[0]?.id || 1,
      description: ''
    });
  };

  // Пагинация для товаров
  const totalProductPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Панель управления</h1>
        <button className="logout-btn" onClick={() => alert('Выход из админки')}>
          Выход
        </button>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} 
          onClick={() => setActiveTab('products')}
        >
          📦 Товары
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} 
          onClick={() => setActiveTab('orders')}
        >
          📋 Заказы
        </button>
        <button 
          className="add-product-btn"
          onClick={() => document.querySelector('.product-form')?.scrollIntoView({ behavior: 'smooth' })}
        >
          + Добавить товар
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <form onSubmit={handleProductSubmit} className="product-form">
            <h3>{editingProduct ? '✏️ Редактировать товар' : '➕ Добавить товар'}</h3>
            
            <div className="form-row">
              <div className="form-field">
                <label>Название товара *</label>
                <input 
                  type="text" 
                  placeholder="LED лампа E27 7W" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-field">
                <label>Цена *</label>
                <input 
                  type="number" 
                  placeholder="299" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-field">
                <label>Остаток *</label>
                <input 
                  type="number" 
                  placeholder="100" 
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Тип цоколя</label>
                <select value={formData.socket_type} onChange={e => setFormData({...formData, socket_type: e.target.value})}>
                  <option value="E27">E27</option>
                  <option value="E14">E14</option>
                  <option value="GU10">GU10</option>
                  <option value="GX53">GX53</option>
                  <option value="G9">G9</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>Мощность (Вт)</label>
                <input 
                  type="number" 
                  placeholder="7" 
                  value={formData.power_watt} 
                  onChange={e => setFormData({...formData, power_watt: e.target.value})} 
                />
              </div>
              
              <div className="form-field">
                <label>Температура (K)</label>
                <input 
                  type="number" 
                  placeholder="2700" 
                  value={formData.color_temp_k} 
                  onChange={e => setFormData({...formData, color_temp_k: e.target.value})} 
                />
              </div>
              
              <div className="form-field">
                <label>Категория</label>
                <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                  {categories.length === 0 && <option value="1">LED лампочки</option>}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label>Описание</label>
                <textarea 
                  placeholder="Описание товара..." 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="submit">{editingProduct ? 'Обновить' : 'Создать'}</button>
              {editingProduct && (
                <button type="button" className="cancel-btn" onClick={cancelEdit}>
                  Отмена
                </button>
              )}
            </div>
          </form>

          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Мощность</th>
                  <th>Цоколь</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.power_watt || '-'} Вт</td>
                    <td>{product.socket_type || '-'}</td>
                    <td style={{ color: '#E67E22', fontWeight: 'bold' }}>
                      {Number(product.price).toLocaleString()} ₽
                    </td>
                    <td>
                      <input 
                        type="number" 
                        className="stock-input"
                        value={product.stock} 
                        onChange={e => handleStockUpdate(product.id, parseInt(e.target.value))} 
                      />
                    </td>
                    <td>
                      <button className="edit-btn-admin" onClick={() => handleEditProduct(product)}>
                        ред.
                      </button>
                      <button className="delete-btn-admin" onClick={() => handleDeleteProduct(product.id)}>
                        уд.
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                      Нет товаров. Создайте первый!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalProductPages > 1 && (
            <div className="pagination-admin">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                disabled={currentPage === 1}
              >
                ←
              </button>
              {[...Array(totalProductPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? 'active' : ''}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalProductPages, p+1))}
                disabled={currentPage === totalProductPages}
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'orders' && (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Номер заказа</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_phone}</td>
                  <td style={{ fontWeight: 'bold' }}>{Number(order.total_amount).toLocaleString()} ₽</td>
                  <td>
                    <select
                      className="status-select-admin"
                      value={order.status}
                      onChange={e => handleStatusUpdate(order.id, e.target.value)}
                    >
                      <option value="new">Новый</option>
                      <option value="confirmed">Подтвержден</option>
                      <option value="paid">Оплачен</option>
                      <option value="shipped">Отправлен</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: order.status === 'delivered' ? 'rgba(76,175,80,0.15)' : 
                                order.status === 'cancelled' ? 'rgba(231,76,60,0.15)' : 'rgba(255,214,0,0.15)',
                      color: order.status === 'delivered' ? '#4CAF50' :
                             order.status === 'cancelled' ? '#E74C3C' : '#FFC107'
                    }}>
                      {getStatusName(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    Нет заказов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Admin;