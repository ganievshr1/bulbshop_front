import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import { useCart } from '../context/CartContext';
import './Catalog.css';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCount, setShowCount] = useState(0);
  
  const [filters, setFilters] = useState({
    socket_type: '',
    min_price: '',
    max_price: '',
    in_stock_only: false
  });
  
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortBy, allProducts, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();
      setAllProducts(productsData);
      setProducts(productsData);
      setShowCount(productsData.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...allProducts];
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filters.socket_type) {
      filtered = filtered.filter(p => p.socket_type === filters.socket_type);
    }
    
    if (filters.min_price) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.min_price));
    }
    if (filters.max_price) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.max_price));
    }
    
    if (filters.in_stock_only) {
      filtered = filtered.filter(p => p.stock > 0);
    }
    
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setProducts(filtered);
    setShowCount(filtered.length);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
      alert(`✅ ${product.name} добавлен в корзину!`);
    } else {
      alert('❌ Товар временно отсутствует');
    }
  };

  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSocketTypeName = (type) => {
    const types = {
      'E27': 'E27',
      'E14': 'E14',
      'GU10': 'GU10',
      'GX53': 'GX53',
      'G9': 'G9',
      'LED Strip': 'LED лента',
      'R7s': 'R7s'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка товаров...</p>
      </div>
    );
  }

  return (
    <div className="catalog-container">
      {/* Верхняя поисковая строка */}
      <div className="search-header">
        <div className="search-bar">
          <div className="logo">💡 Завод лампочек</div>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder={`🔍 Нашли ${showCount} товаров, искать «Лампочки»`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-icons">
            <span>❤️</span>
            <span>🛒</span>
            <span>👤</span>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="catalog-content">
        {/* Левая панель фильтров */}
        <div className="filters-panel">
          <div className="filters-title">Фильтры</div>

          <div className="filter-group">
            <h4>Способ получения</h4>
            <label className="filter-checkbox">
              <input type="checkbox" /> <span>Самовывоз в магазине</span>
              <span className="filter-count">(441)</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" /> <span>Пункты выдачи</span>
              <span className="filter-count">(2970)</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" /> <span>Доставка курьером</span>
              <span className="filter-count">(3167)</span>
            </label>
          </div>

          <div className="filter-group">
            <h4>Наличие в магазинах</h4>
            <label className="filter-checkbox">
              <input type="checkbox" /> <span>Уфа Мега</span>
              <span className="filter-count">(427)</span>
            </label>
            <label className="filter-checkbox">
              <input type="checkbox" /> <span>Уфа Планета</span>
              <span className="filter-count">(419)</span>
            </label>
          </div>

          <div className="filter-group">
            <h4>Снижение цены</h4>
            <label className="filter-checkbox">
              <input type="checkbox" name="on_sale" /> <span>Да</span>
              <span className="filter-count">(231)</span>
            </label>
          </div>

          <div className="filter-group">
            <h4>Цена</h4>
            <div className="price-inputs">
              <input
                type="number"
                name="min_price"
                className="price-input"
                placeholder="от 28"
                value={filters.min_price}
                onChange={handleFilterChange}
              />
              <span className="price-separator">—</span>
              <input
                type="number"
                name="max_price"
                className="price-input"
                placeholder="до 213 022"
                value={filters.max_price}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="filter-group">
            <h4>Город</h4>
            <select className="city-select" defaultValue="ufa">
              <option value="ufa">📍 Уфа</option>
              <option value="msk">📍 Москва</option>
              <option value="spb">📍 Санкт-Петербург</option>
            </select>
          </div>

          <div className="filter-group">
            <h4>Рекомендуем</h4>
            <label className="filter-checkbox">
              <input type="checkbox" /> <span>Рекомендуемые товары</span>
            </label>
          </div>

          <div className="filter-group">
            <h4>Цоколь</h4>
            <select
              name="socket_type"
              className="socket-select"
              value={filters.socket_type}
              onChange={handleFilterChange}
            >
              <option value="">Все цоколи</option>
              <option value="E27">E27</option>
              <option value="E14">E14</option>
              <option value="GU10">GU10</option>
              <option value="GX53">GX53</option>
              <option value="G9">G9</option>
            </select>
          </div>

          <button className="show-products-btn" onClick={applyFiltersAndSort}>
            Показать {showCount} товаров
          </button>
        </div>

        {/* Правая область с товарами */}
        <div className="products-area">
          <div className="products-header">
            <div className="products-count">Показать {showCount} товаров</div>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">По названию</option>
              <option value="price_asc">Цена: по возрастанию</option>
              <option value="price_desc">Цена: по убыванию</option>
            </select>
          </div>

          <div className="products-grid">
            {paginatedProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="product-image-placeholder">💡</div>
                  )}
                </div>
                <div className="product-info">
                  <div className="product-sku">Арт. {product.id}</div>
                  <div className="product-title">{product.name}</div>
                  <div className="product-specs">
                    {product.power_watt && `${product.power_watt} Вт`}
                    {product.socket_type && ` · ${getSocketTypeName(product.socket_type)}`}
                    {product.color_temp_k && ` · ${product.color_temp_k}K`}
                  </div>
                  <div className="product-description">
                    {product.description?.substring(0, 60)}...
                  </div>
                  <div className="product-badge">✅ Без пульсации</div>
                  <div className="product-price">{product.price.toLocaleString()} ₽</div>
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.stock === 0}
                  >
                    В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                ←
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={currentPage === pageNum ? 'active' : ''}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span>...</span>
                  <button onClick={() => goToPage(totalPages)}>{totalPages}</button>
                </>
              )}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;