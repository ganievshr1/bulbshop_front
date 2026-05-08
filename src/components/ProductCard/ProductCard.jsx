import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useNotification } from '../../context/NotificationContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { showNotification } = useNotification();

  if (!product) return null;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    showNotification(`«${product.name}» добавлен в корзину`, 'success');
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(product);
    const wasAdded = !isFavorite(product.id);
    if (wasAdded) {
      showNotification(`«${product.name}» добавлен в избранное ❤️`, 'success');
    }
  };

  const isInStock = product.stock > 0;
  const formatPrice = (price) => Number(price).toLocaleString('ru-RU');
  const favorite = isFavorite(product.id);

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageWrapper}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={styles.image}
          />
        ) : (
          <span className={styles.placeholder}>💡</span>
        )}
        <button 
          className={`${styles.favBtn} ${favorite ? styles.favActive : ''}`}
          onClick={handleFavoriteClick}
        >
          {favorite ? '❤️' : '🤍'}
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