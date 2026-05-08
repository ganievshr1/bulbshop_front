import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectTotalItems } from '../../store/cartSlice';
import { selectFavoritesCount } from '../../store/favoritesSlice';
import { updateSearch } from '../../store/searchSlice';
import styles from './Header.module.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const itemCount = useSelector(selectTotalItems);
  const favCount = useSelector(selectFavoritesCount);
  const [localSearch, setLocalSearch] = useState('');

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const performSearch = () => {
    if (localSearch.trim()) {
      dispatch(updateSearch(localSearch.trim()));
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