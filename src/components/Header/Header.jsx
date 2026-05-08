import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { useFavorites } from '../../context/FavoritesContext';
import styles from './Header.module.css';

const Header = () => {
  const { getTotalItems } = useCart();
  const { updateSearch } = useSearch();
  const { getFavoritesCount } = useFavorites();
  const itemCount = getTotalItems();
  const favCount = getFavoritesCount();
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const performSearch = () => {
    if (localSearch.trim()) {
      updateSearch(localSearch.trim());
      navigate('/catalog');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo}>
          Завод лампочек
        </Link>
        
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="🔍 Найти товары..."
            className={styles.searchInput}
            value={localSearch}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.searchButton} onClick={performSearch}>
            🔍
          </button>
        </div>

        <div className={styles.icons}>
          <Link to="/favorites" className={styles.iconBtn}>
            ❤️
            {favCount > 0 && <span className={styles.favBadge}>{favCount}</span>}
          </Link>
          <Link to="/cart" className={styles.iconBtn}>
            🛒
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </Link>
        </div>
      </div>
      
      <nav className={styles.navBar}>
        <Link to="/" className={styles.navLink}>Главная</Link>
        <Link to="/catalog" className={styles.navLink}>Каталог</Link>
        <Link to="/admin" className={styles.navLink}>Админка</Link>
      </nav>
    </header>
  );
};

export default Header;