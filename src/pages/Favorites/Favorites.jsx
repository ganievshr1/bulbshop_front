import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectFavorites, removeFromFavorites } from '../../store/favoritesSlice';
import { addToCart } from '../../store/cartSlice';
import styles from './Favorites.module.css';

const Favorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const favorites = useSelector(selectFavorites);

  if (favorites.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h2>🤍 В избранном пусто</h2>
          <p>Добавляйте товары, нажимая на сердечко</p>
          <button onClick={() => navigate('/catalog')}>Перейти в каталог</button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => Number(price).toLocaleString('ru-RU');

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Избранное</h1>

      <div className={styles.itemsList}>
        {favorites.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemImage}>
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} />
              ) : (
                <span>💡</span>
              )}
            </div>

            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <span className={styles.itemSku}>Арт. {item.id}</span>
              {item.power_watt && (
                <span className={styles.itemSpec}>
                  {item.power_watt} Вт • {item.socket_type}
                </span>
              )}
            </div>

            <div className={styles.itemPrice}>
              {formatPrice(item.price)} ₽
            </div>

            <div className={styles.itemActions}>
              <button
                className={styles.addToCartBtn}
                onClick={() => {
                  dispatch(addToCart({ product: item, quantity: 1 }));
                  navigate('/cart');
                }}
                disabled={item.stock <= 0}
              >
                🛒
              </button>
              <button
                className={styles.removeBtn}
                onClick={() => dispatch(removeFromFavorites(item.id))}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/catalog')}>
        ← Продолжить покупки
      </button>
    </div>
  );
};

export default Favorites;