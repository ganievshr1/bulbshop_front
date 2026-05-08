import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './Catalog.module.css';

const Catalog = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    socket_type: '',
    min_price: '',
    max_price: '',
    in_stock_only: false,
  });
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  const { addToCart } = useCart();
  const { searchQuery, clearSearch } = useSearch();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      if (!productsResult.success) {
        throw new Error(productsResult.error || 'Ошибка загрузки товаров');
      }

      setAllProducts(Array.isArray(productsResult.data) ? productsResult.data : []);
      setCategories(Array.isArray(categoriesResult.data) ? categoriesResult.data : []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = allProducts
    .filter((product) => {
      if (!product) return false;

      if (searchQuery) {
        const term = searchQuery.toLowerCase();
        const nameMatch = product.name?.toLowerCase().includes(term);
        const descMatch = product.description?.toLowerCase().includes(term);
        const skuMatch = product.id?.toString().includes(term);
        const socketMatch = product.socket_type?.toLowerCase().includes(term);
        if (!nameMatch && !descMatch && !skuMatch && !socketMatch) return false;
      }

      if (filters.socket_type && product.socket_type !== filters.socket_type) {
        return false;
      }

      if (filters.min_price && product.price < Number(filters.min_price)) {
        return false;
      }

      if (filters.max_price && product.price > Number(filters.max_price)) {
        return false;
      }

      if (filters.in_stock_only && product.stock <= 0) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '', 'ru');
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * productsPerPage,
    safePage * productsPerPage
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({ socket_type: '', min_price: '', max_price: '', in_stock_only: false });
    clearSearch();
    setSortBy('name');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner} />
          <p>Загрузка каталога...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorWrapper}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>Ошибка загрузки</h2>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={loadData}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (allProducts.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyWrapper}>
          <span className={styles.emptyIcon}>📦</span>
          <h2>Товары не найдены</h2>
          <p>В данный момент каталог пуст</p>
          <button className={styles.retryBtn} onClick={loadData}>
            Обновить
          </button>
        </div>
      </div>
    );
  }

  const socketTypes = [...new Set(allProducts.map((p) => p.socket_type).filter(Boolean))];

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <h3 className={styles.filterTitle}>Фильтры</h3>

          <div className={styles.filterSection}>
            <h4>Способ получения</h4>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              <span>Самовывоз в магазине</span>
              <span className={styles.count}>(441)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>Пункты выдачи</span>
              <span className={styles.count}>(2970)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>Доставка курьером</span>
              <span className={styles.count}>(3167)</span>
            </label>
          </div>

          <div className={styles.filterSection}>
            <h4>Наличие в магазинах</h4>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>📍 Уфа Мега</span>
              <span className={styles.count}>(427)</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>📍 Уфа Планета</span>
              <span className={styles.count}>(419)</span>
            </label>
          </div>

          <div className={styles.filterSection}>
            <h4>Снижение цены</h4>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" />
              <span>Да</span>
              <span className={styles.count}>(231)</span>
            </label>
          </div>

          <div className={styles.filterSection}>
            <h4>Цена, ₽</h4>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="от 28"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
              <input
                type="number"
                placeholder="до 213 022"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4>Город</h4>
            <div className={styles.citySelector}>
              <span>📍 Уфа</span>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h4>Тип цоколя</h4>
            <select
              value={filters.socket_type}
              onChange={(e) => handleFilterChange('socket_type', e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Все</option>
              {socketTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h4>Рекомендуем</h4>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" defaultChecked />
              <span>Рекомендуемые товары</span>
            </label>
          </div>

          <button className={styles.showBtn}>
            Показать {filteredProducts.length} товаров
          </button>
        </aside>

        <div className={styles.mainArea}>
          <div className={styles.sortRow}>
            <span>Найдено: {filteredProducts.length} товаров</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="name">По названию</option>
              <option value="price_asc">Цена: по возрастанию</option>
              <option value="price_desc">Цена: по убыванию</option>
            </select>
          </div>

          {searchQuery && (
            <div style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
              Результаты поиска: «{searchQuery}»
              <button 
                onClick={resetFilters}
                style={{ 
                  marginLeft: '8px', 
                  padding: '2px 8px', 
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                ✕ Сбросить
              </button>
            </div>
          )}

          {paginatedProducts.length === 0 ? (
            <div className={styles.noResults}>
              <p>По вашему запросу ничего не найдено</p>
              <button className={styles.resetBtn} onClick={resetFilters}>
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Назад
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={page === currentPage ? styles.active : ''}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Вперёд →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;