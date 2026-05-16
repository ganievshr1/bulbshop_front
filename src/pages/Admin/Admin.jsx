import { useState, useEffect } from 'react';
import {
  getAdminProducts, createProduct, updateProduct, deleteProduct, updateProductStock,
  getAdminOrders, updateOrderStatus, getCategories, createCategory, updateCategory,
  adminLogin, adminLogout, getCurrentAdmin, isAuthenticated, changeAdminPassword
} from '../../services/api';
import styles from './Admin.module.css';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const itemsPerPage = 10;

  // Состояния для смены пароля
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

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
    voltage: '',
    form: '',
    color_temp: '',
    category_id: 1,
    image_url: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (isAuthenticated()) {
      const result = await getCurrentAdmin();
      if (result.success && result.data) {
        setAdmin(result.data);
        setIsLoggedIn(true);
        await loadCategories();
        await loadData();
      } else {
        await handleLogout();
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    const result = await adminLogin(loginForm.login, loginForm.password);
    
    if (result.success) {
      setIsLoggedIn(true);
      setAdmin(result.admin);
      setLoginForm({ login: '', password: '' });
      await loadCategories();
      await loadData();
    } else {
      setLoginError(result.error || 'Неверный логин или пароль');
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsLoggedIn(false);
    setAdmin(null);
    setProducts([]);
    setOrders([]);
    setCategories([]);
  };

  // Обработчик смены пароля
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Новый пароль и подтверждение не совпадают');
      return;
    }
    
    if (passwordForm.newPassword.length < 4) {
      setPasswordError('Новый пароль должен содержать минимум 4 символа');
      return;
    }
    
    setPasswordLoading(true);
    
    const result = await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    if (result.success) {
      setPasswordSuccess(result.message || 'Пароль успешно изменен');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // Через 2 секунды закрываем модалку
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } else {
      setPasswordError(result.error || 'Ошибка при смене пароля');
    }
    
    setPasswordLoading(false);
  };

  const loadCategories = async () => {
    try {
      const result = await getCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
        if (result.data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: result.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminProducts({ page: currentPage, limit: itemsPerPage });
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
      } else {
        setError('Не удалось загрузить товары');
        setProducts([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setError('Ошибка при загрузке товаров');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminOrders();
      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data);
      } else {
        setError('Не удалось загрузить заказы');
        setOrders([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setError('Ошибка при загрузке заказов');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (activeTab === 'products') {
      await loadProducts();
    } else if (activeTab === 'orders') {
      await loadOrders();
    } else if (activeTab === 'categories') {
      await loadCategories();
    }
  };

  // Страница входа
  if (!isLoggedIn) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>🔐 Вход в админ-панель</h1>
          <p className={styles.loginSubtitle}>Завод лампочек</p>
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label>Логин</label>
              <input
                type="text"
                value={loginForm.login}
                onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                placeholder="admin"
                required
                autoFocus
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Пароль</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••"
                required
              />
            </div>
            
            {loginError && (
              <div className={styles.loginError}>
                ❌ {loginError}
              </div>
            )}
            
            <button type="submit" className={styles.loginBtn} disabled={loginLoading}>
              {loginLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Обработчики товаров
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, productData);
        if (result.success) alert('Товар успешно обновлен');
        else alert('Ошибка при обновлении товара');
      } else {
        result = await createProduct(productData);
        if (result.success) alert('Товар успешно добавлен');
        else alert('Ошибка при добавлении товара');
      }

      if (result.success) {
        resetForm();
        await loadProducts();
      }
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      alert('Ошибка при сохранении товара: ' + error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
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
      voltage: '',
      form: '',
      color_temp: '',
      category_id: product.category_id || categories?.[0]?.id || 1,
      image_url: product.image_url || ''
    });
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          alert('Товар удален');
          await loadProducts();
        } else {
          alert('Ошибка при удалении товара');
        }
      } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Ошибка при удалении товара');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setShowAddForm(false);
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
      voltage: '',
      form: '',
      color_temp: '',
      category_id: categories?.[0]?.id || 1,
      image_url: ''
    });
  };

  // Обработчики категорий
  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    if (!categoryFormData.name) {
      alert('Название категории обязательно');
      return;
    }

    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, categoryFormData);
        if (result.success) alert('Категория обновлена');
        else alert('Ошибка при обновлении категории');
      } else {
        result = await createCategory(categoryFormData);
        if (result.success) alert('Категория создана');
        else alert('Ошибка при создании категории');
      }

      if (result.success) {
        resetCategoryForm();
        await loadCategories();
      }
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
      alert('Ошибка при сохранении категории');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
    setCategoryFormData({
      name: category.name || '',
      description: category.description || ''
    });
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setShowCategoryForm(false);
    setCategoryFormData({ name: '', description: '' });
  };

  // Обработчики заказов
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        alert('Статус заказа обновлен');
        await loadOrders();
      } else {
        alert('Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return '🆕 Новый';
      case 'confirmed': return '✅ Подтвержден';
      case 'paid': return '💳 Оплачен';
      case 'shipped': return '🚚 Отправлен';
      case 'delivered': return '📦 Доставлен';
      case 'cancelled': return '❌ Отменен';
      default: return status;
    }
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div>
          <h1 className={styles.adminLogo}>🏭 Завод лампочек — Админка</h1>
          {admin && <span className={styles.adminName}>{admin.full_name} ({admin.role})</span>}
        </div>
        <div className={styles.headerButtons}>
          <button 
            className={styles.changePasswordBtn}
            onClick={() => setShowPasswordModal(true)}
          >
            🔑 Сменить пароль
          </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 Выход
          </button>
        </div>
      </header>

      <div className={styles.adminContent}>
        <h2 className={styles.pageTitle}>Панель управления</h2>

        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={() => { setError(null); loadData(); }}>
              Повторить
            </button>
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
              onClick={() => { setActiveTab('products'); setCurrentPage(1); loadProducts(); }}
            >
              📦 Товары
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
              onClick={() => { setActiveTab('orders'); setCurrentPage(1); loadOrders(); }}
            >
              📋 Заказы
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
              onClick={() => { setActiveTab('categories'); setCurrentPage(1); loadCategories(); }}
            >
              🏷️ Категории
            </button>
          </div>
          
          {activeTab === 'products' && (
            <button
              className={styles.addBtn}
              onClick={() => { setShowAddForm(!showAddForm); setEditingProduct(null); }}
            >
              {showAddForm ? '✖ Закрыть форму' : '+ Добавить товар'}
            </button>
          )}
          
          {activeTab === 'categories' && (
            <button
              className={styles.addBtn}
              onClick={() => { setShowCategoryForm(!showCategoryForm); setEditingCategory(null); }}
            >
              {showCategoryForm ? '✖ Закрыть форму' : '+ Добавить категорию'}
            </button>
          )}
        </div>

        {/* Форма товара */}
        {showAddForm && activeTab === 'products' && (
          <div className={styles.formSection}>
            <h3>{editingProduct ? '✏️ Редактирование товара' : '➕ Добавление нового товара'}</h3>
            <form className={styles.productForm} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Название *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Цена *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required step="0.01" />
                </div>
                <div className={styles.formGroup}>
                  <label>Остаток *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Категория *</label>
                  <select name="category_id" value={formData.category_id} onChange={handleInputChange} required>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Цоколь</label>
                  <input type="text" name="socket_type" value={formData.socket_type} onChange={handleInputChange} placeholder="E27, E14, GU10..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Мощность (Вт)</label>
                  <input type="number" name="power_watt" value={formData.power_watt} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Световой поток (лм)</label>
                  <input type="number" name="lumen" value={formData.lumen} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Цветовая температура (K)</label>
                  <input type="number" name="color_temp_k" value={formData.color_temp_k} onChange={handleInputChange} placeholder="2700, 4000, 6500..." />
                </div>
                <div className={styles.formGroup}>
                  <label>Срок службы (часов)</label>
                  <input type="number" name="lifespan_hours" value={formData.lifespan_hours} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Напряжение</label>
                  <input type="text" name="voltage" value={formData.voltage} onChange={handleInputChange} placeholder="220-240 В" />
                </div>
                <div className={styles.formGroup}>
                  <label>Форм-фактор</label>
                  <input type="text" name="form" value={formData.form} onChange={handleInputChange} placeholder="спот, шар, свеча" />
                </div>
                <div className={styles.formGroup}>
                  <label>Цвет свечения</label>
                  <input type="text" name="color_temp" value={formData.color_temp} onChange={handleInputChange} placeholder="нейтральный белый свет" />
                </div>
                <div className={styles.formGroup}>
                  <label>Описание</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
                </div>
                <div className={styles.formGroup}>
                  <label>URL изображения</label>
                  <input type="text" name="image_url" value={formData.image_url} onChange={handleInputChange} placeholder="https://..." />
                </div>
              </div>
              <div className={styles.formButtons}>
                <button type="submit" className={styles.submitBtn}>
                  {editingProduct ? '💾 Сохранить' : '➕ Добавить'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                  ❌ Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Форма категории */}
        {showCategoryForm && activeTab === 'categories' && (
          <div className={styles.formSection}>
            <h3>{editingCategory ? '✏️ Редактирование категории' : '➕ Добавление новой категории'}</h3>
            <form className={styles.productForm} onSubmit={handleCategorySubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Название *</label>
                  <input type="text" name="name" value={categoryFormData.name} onChange={handleCategoryInputChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label>Описание</label>
                  <textarea name="description" value={categoryFormData.description} onChange={handleCategoryInputChange} rows="3" />
                </div>
              </div>
              <div className={styles.formButtons}>
                <button type="submit" className={styles.submitBtn}>
                  {editingCategory ? '💾 Сохранить' : '➕ Добавить'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={resetCategoryForm}>
                  ❌ Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Таблица товаров */}
        {activeTab === 'products' && (
          <div className={styles.tableWrapper}>
            {loading ? (
              <div className={styles.loadingState}>⏳ Загрузка товаров...</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>
                <p>📭 Нет товаров для отображения</p>
                {!showAddForm && (
                  <button className={styles.addBtn} onClick={() => setShowAddForm(true)}>
                    + Добавить первый товар
                  </button>
                )}
              </div>
            ) : (
              <>
                <table className={styles.table}>
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
                        <td className={styles.productName}>{product.name}</td>
                        <td>{product.power_watt ? `${product.power_watt} Вт` : '-'}</td>
                        <td>{product.socket_type || '-'}</td>
                        <td className={styles.priceCell}>{Number(product.price).toLocaleString('ru-RU')} ₽</td>
                        <td className={`${styles.stockCell} ${product.stock === 0 ? styles.outOfStock : ''}`}>
                          {product.stock}
                        </td>
                        <td>
                          <button className={styles.editBtn} onClick={() => handleEditProduct(product)}>✏️ ред.</button>
                          <button className={styles.deleteBtn} onClick={() => handleDeleteProduct(product.id)}>🗑️ уд.</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
                      ← Назад
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={page === currentPage ? styles.active : ''}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      Вперёд →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Таблица заказов */}
        {activeTab === 'orders' && (
          <div className={styles.tableWrapper}>
            {loading ? (
              <div className={styles.loadingState}>⏳ Загрузка заказов...</div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <p>📭 Нет заказов для отображения</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>№ заказа</th>
                    <th>Клиент</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className={styles.orderNumber}>{order.order_number}</td>
                      <td className={styles.customerName}>{order.customer_name}</td>
                      <td className={styles.priceCell}>{Number(order.total_amount).toLocaleString('ru-RU')} ₽</td>
                      <td className={styles.statusCell}>{getStatusText(order.status)}</td>
                      <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={styles.statusSelect}
                        >
                          <option value="new">🆕 Новый</option>
                          <option value="confirmed">✅ Подтвержден</option>
                          <option value="paid">💳 Оплачен</option>
                          <option value="shipped">🚚 Отправлен</option>
                          <option value="delivered">📦 Доставлен</option>
                          <option value="cancelled">❌ Отменен</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Таблица категорий */}
        {activeTab === 'categories' && (
          <div className={styles.tableWrapper}>
            {loading ? (
              <div className={styles.loadingState}>⏳ Загрузка категорий...</div>
            ) : categories.length === 0 ? (
              <div className={styles.emptyState}>
                <p>📭 Нет категорий для отображения</p>
                {!showCategoryForm && (
                  <button className={styles.addBtn} onClick={() => setShowCategoryForm(true)}>
                    + Добавить первую категорию
                  </button>
                )}
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Описание</th>
                    <th>Активна</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td className={styles.categoryName}>{category.name}</td>
                      <td className={styles.categoryDesc}>{category.description || '-'}</td>
                      <td className={styles.activeCell}>{category.is_active ? '✅ Да' : '❌ Нет'}</td>
                      <td>
                        <button className={styles.editBtn} onClick={() => handleEditCategory(category)}>✏️ ред.</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно смены пароля */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🔑 Смена пароля</h3>
              <button className={styles.modalClose} onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label>Текущий пароль *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Новый пароль *</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                <small className={styles.formHint}>Минимум 4 символа</small>
              </div>
              
              <div className={styles.formGroup}>
                <label>Подтвердите новый пароль *</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              
              {passwordError && (
                <div className={styles.passwordError}>
                  ❌ {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className={styles.passwordSuccess}>
                  ✅ {passwordSuccess}
                </div>
              )}
              
              <div className={styles.modalButtons}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowPasswordModal(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitBtn} disabled={passwordLoading}>
                  {passwordLoading ? 'Смена...' : 'Сменить пароль'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;