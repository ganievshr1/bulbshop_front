import { useState, useEffect, useCallback } from 'react';
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
  
  // Пагинация для товаров
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, total_pages: 0 });
  const itemsPerPage = 10;
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null); // id товара, который удаляется

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
    setCurrentPage(1);
  };

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
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } else {
      setPasswordError(result.error || 'Ошибка при смене пароля');
    }
    
    setPasswordLoading(false);
  };

  const loadCategories = useCallback(async () => {
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
  }, [formData.category_id]);

  // Загрузка товаров с серверной пагинацией
  const loadProducts = useCallback(async (page = currentPage, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const result = await getAdminProducts({ 
        page: page, 
        limit: itemsPerPage 
      });
      
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        setError(result.error || 'Не удалось загрузить товары');
        setProducts([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      setError('Ошибка при загрузке товаров');
      setProducts([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [currentPage]);

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

  const loadData = useCallback(async () => {
    if (activeTab === 'products') {
      await loadProducts(1, true);
      setCurrentPage(1);
    } else if (activeTab === 'orders') {
      await loadOrders();
    } else if (activeTab === 'categories') {
      await loadCategories();
    }
  }, [activeTab, loadProducts, loadCategories]);

  // Обработчик смены страницы
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.total_pages) return;
    setCurrentPage(newPage);
    loadProducts(newPage, true);
  };

  // Обновление только метрик пагинации без полной перезагрузки
  const refreshPaginationMetrics = useCallback(async () => {
    try {
      const result = await getAdminProducts({ 
        page: currentPage, 
        limit: itemsPerPage 
      });
      
      if (result.success && result.pagination) {
        setPagination(result.pagination);
        
        // Если текущая страница больше не существует, переходим на последнюю
        if (currentPage > result.pagination.total_pages && result.pagination.total_pages > 0) {
          setCurrentPage(result.pagination.total_pages);
          await loadProducts(result.pagination.total_pages, false);
        } else if (products.length === 0 && currentPage > 1) {
          const newPage = currentPage - 1;
          setCurrentPage(newPage);
          await loadProducts(newPage, false);
        }
      }
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    }
  }, [currentPage, products.length, loadProducts]);

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

    setLoading(true);
    setError(null);

    try {
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, productData);
        if (result.success) {
          alert('✅ Товар успешно обновлен');
        } else {
          alert('❌ Ошибка при обновлении товара: ' + (result.error || 'Неизвестная ошибка'));
          setError(result.error);
          setLoading(false);
          return;
        }
      } else {
        result = await createProduct(productData);
        if (result.success) {
          alert('✅ Товар успешно добавлен');
        } else {
          alert('❌ Ошибка при добавлении товара: ' + (result.error || 'Неизвестная ошибка'));
          setError(result.error);
          setLoading(false);
          return;
        }
      }

      if (result.success) {
        resetForm();
        await loadProducts(1, true);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      alert('❌ Ошибка при сохранении товара: ' + error.message);
      setError(error.message);
    } finally {
      setLoading(false);
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

  // УЛУЧШЕННАЯ ФУНКЦИЯ УДАЛЕНИЯ ТОВАРА
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      // Сохраняем информацию о товаре и текущем состоянии
      const deletedProduct = products.find(p => p.id === id);
      const wasLastItemOnPage = products.length === 1;
      const currentPageBefore = currentPage;
      
      // Оптимистичное обновление - сразу убираем товар из UI
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteLoading(id);
      
      // Оптимистично обновляем пагинацию
      const newTotal = pagination.total - 1;
      const newTotalPages = Math.ceil(newTotal / itemsPerPage);
      setPagination(prev => ({
        ...prev,
        total: newTotal,
        total_pages: newTotalPages > 0 ? newTotalPages : 1
      }));
      
      try {
        const result = await deleteProduct(id);
        
        if (result.success) {
          // Успешное удаление - показываем уведомление
          const message = `✅ Товар "${deletedProduct?.name || id}" успешно удален`;
          alert(message);
          
          // Проверяем, нужно ли перейти на предыдущую страницу
          if (wasLastItemOnPage && currentPageBefore > 1 && newTotalPages < currentPageBefore) {
            const newPage = currentPageBefore - 1;
            setCurrentPage(newPage);
            await loadProducts(newPage, false);
          } else if (products.length === 1 && currentPageBefore === 1 && newTotal === 0) {
            // Если удалили последний товар на первой странице
            setProducts([]);
            setPagination(prev => ({ ...prev, total: 0, total_pages: 1 }));
          } else {
            // Обновляем метрики пагинации без полной перезагрузки
            await refreshPaginationMetrics();
          }
        } else {
          // Ошибка - восстанавливаем товар
          setProducts(prev => [...prev, deletedProduct].sort((a, b) => a.id - b.id));
          setPagination(prev => ({
            ...prev,
            total: prev.total + 1,
            total_pages: Math.ceil((prev.total + 1) / itemsPerPage)
          }));
          alert('❌ Ошибка при удалении товара: ' + (result.error || 'Неизвестная ошибка'));
          setError(result.error);
        }
      } catch (error) {
        console.error('Ошибка удаления товара:', error);
        
        // При ошибке проверяем, удалился ли товар несмотря на ошибку
        try {
          const checkResult = await getAdminProducts({ page: currentPageBefore, limit: itemsPerPage });
          const productStillExists = checkResult.data?.some(p => p.id === id);
          
          if (!productStillExists && checkResult.success) {
            // Товар всё равно удалился
            alert(`✅ Товар "${deletedProduct?.name || id}" успешно удален`);
            await refreshPaginationMetrics();
          } else {
            // Восстанавливаем товар
            setProducts(prev => [...prev, deletedProduct].sort((a, b) => a.id - b.id));
            setPagination(prev => ({
              ...prev,
              total: prev.total + 1,
              total_pages: Math.ceil((prev.total + 1) / itemsPerPage)
            }));
            alert('❌ Ошибка при удалении товара: ' + error.message);
            setError(error.message);
          }
        } catch (checkError) {
          // Не удалось проверить - восстанавливаем товар
          setProducts(prev => [...prev, deletedProduct].sort((a, b) => a.id - b.id));
          setPagination(prev => ({
            ...prev,
            total: prev.total + 1,
            total_pages: Math.ceil((prev.total + 1) / itemsPerPage)
          }));
          alert('❌ Ошибка при удалении товара: ' + error.message);
          setError(error.message);
        }
      } finally {
        setDeleteLoading(null);
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

    setLoading(true);

    try {
      let result;
      if (editingCategory) {
        result = await updateCategory(editingCategory.id, categoryFormData);
        if (result.success) {
          alert('✅ Категория обновлена');
        } else {
          alert('❌ Ошибка при обновлении категории');
          setLoading(false);
          return;
        }
      } else {
        result = await createCategory(categoryFormData);
        if (result.success) {
          alert('✅ Категория создана');
        } else {
          alert('❌ Ошибка при создании категории');
          setLoading(false);
          return;
        }
      }

      if (result.success) {
        resetCategoryForm();
        await loadCategories();
      }
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
      alert('❌ Ошибка при сохранении категории: ' + error.message);
    } finally {
      setLoading(false);
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

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        alert('✅ Статус заказа обновлен');
        await loadOrders();
      } else {
        alert('❌ Ошибка при обновлении статуса: ' + (result.error || 'Неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('❌ Ошибка при обновлении статуса: ' + error.message);
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
              onClick={() => { setActiveTab('products'); loadProducts(1, true); setCurrentPage(1); }}
            >
              📦 Товары
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
              onClick={() => { setActiveTab('orders'); loadOrders(); }}
            >
              📋 Заказы
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
              onClick={() => { setActiveTab('categories'); loadCategories(); }}
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
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? '⏳ Сохранение...' : (editingProduct ? '💾 Сохранить' : '➕ Добавить')}
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
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? '⏳ Сохранение...' : (editingCategory ? '💾 Сохранить' : '➕ Добавить')}
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
                    {products.map(product => (
                      <tr key={product.id} className={deleteLoading === product.id ? styles.deletingRow : ''}>
                        <td>{product.id}</td>
                        <td className={styles.productName}>{product.name}</td>
                        <td>{product.power_watt ? `${product.power_watt} Вт` : '-'}</td>
                        <td>{product.socket_type || '-'}</td>
                        <td className={styles.priceCell}>{Number(product.price).toLocaleString('ru-RU')} ₽</td>
                        <td className={`${styles.stockCell} ${product.stock === 0 ? styles.outOfStock : ''}`}>
                          {product.stock}
                        </td>
                        <td>
                          <button 
                            className={styles.editBtn} 
                            onClick={() => handleEditProduct(product)}
                            disabled={deleteLoading === product.id}
                          >
                            ✏️ ред.
                          </button>
                          <button 
                            className={styles.deleteBtn} 
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={deleteLoading === product.id}
                          >
                            {deleteLoading === product.id ? '⏳' : '🗑️ уд.'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Пагинация */}
                {pagination.total_pages > 1 && (
                  <div className={styles.pagination}>
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage <= 1 || loading}
                    >
                      ← Назад
                    </button>
                    
                    {Array.from({ length: Math.min(pagination.total_pages, 10) }, (_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 10) {
                        pageNum = i + 1;
                      } else if (currentPage <= 6) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.total_pages - 5) {
                        pageNum = pagination.total_pages - 9 + i;
                      } else {
                        pageNum = currentPage - 5 + i;
                      }
                      
                      if (pageNum < 1 || pageNum > pagination.total_pages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          className={pageNum === currentPage ? styles.active : ''}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                        >
                          {pageNum}
                        </button>
                      );
                    }).filter(Boolean)}
                    
                    {pagination.total_pages > 10 && currentPage < pagination.total_pages - 5 && (
                      <>
                        <span>...</span>
                        <button onClick={() => handlePageChange(pagination.total_pages)}>
                          {pagination.total_pages}
                        </button>
                      </>
                    )}
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage >= pagination.total_pages || loading}
                    >
                      Вперёд →
                    </button>
                  </div>
                )}
                
                <div className={styles.paginationInfo}>
                  Показано {products.length} из {pagination.total} товаров (страница {currentPage} из {pagination.total_pages || 1})
                </div>
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