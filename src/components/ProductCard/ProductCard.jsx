import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/cartSlice';
import { toggleFavorite, selectIsFavorite } from '../../store/favoritesSlice';
import { useNotification } from '../../context/NotificationContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showNotification } = useNotification();
  const isFavorite = useSelector(selectIsFavorite(product?.id));

  if (!product) return null;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ product }));
    showNotification(`«${product.name}» добавлен в корзину`, 'success');
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(product));
    if (!isFavorite) {
      showNotification(`«${product.name}» добавлен в избранное ❤️`, 'success');
    }
  };

  const isInStock = product.stock > 0;
  const formatPrice = (price) => Number(price).toLocaleString('ru-RU');

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageWrapper}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.image} />
        ) : (
          <span className={styles.placeholder}>💡</span>
        )}
        <button 
          className={`${styles.favBtn} ${isFavorite ? styles.favActive : ''}`}
          onClick={handleFavoriteClick}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div className={styles.info}>
        <span className={styles.sku}>Арт. {product.id}</span>
        <h3 className={styles.name}>{product.name}</h3>
        
        {product.power_watt && product.socket_type && (
          <p className={styles.specs}>
            {product.voltage || '220–240 В'} • {product.power_watt} Вт {product.form || 'спот'}
          </p>
        )}
        
        {product.lumen && (
          <p className={styles.specs}>
            {product.lumen} лм {product.color_temp || 'нейтральный'}
          </p>
        )}

        <span className={styles.badge}>✅ Без пульсации</span>

        <div className={styles.bottom}>
          <span className={styles.price}>{formatPrice(product.price)} ₽</span>
          <button
            className={styles.addBtn}
            onClick={handleAddClick}
            disabled={!isInStock}
          >
            {isInStock ? 'В корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;