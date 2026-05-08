import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductById, clearCurrentProduct } from '../../store/productsSlice';
import { addToCart } from '../../store/cartSlice';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct: product, loading, error } = useSelector(state => state.products);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (product && product.stock >= quantity) {
      dispatch(addToCart({ product, quantity }));
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.stateWrapper}>
          <div className={styles.spinner} />
          <p>Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.page}>
        <div className={styles.stateWrapper}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>{error || 'Товар не найден'}</h2>
          <button className={styles.backBtn} onClick={() => navigate('/catalog')}>
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => Number(price).toLocaleString('ru-RU');
  const isInStock = product.stock > 0;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.imageSection}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className={styles.image} />
          ) : (
            <span className={styles.placeholder}>💡</span>
          )}
        </div>

        <div className={styles.infoSection}>
          <span className={styles.sku}>Арт. {product.id}</span>
          <h1 className={styles.title}>{product.name}</h1>
          
          {product.power_watt && product.socket_type && (
            <p className={styles.specs}>
              {product.voltage || '220–240 В'} • {product.power_watt} Вт {product.form || 'спот'}
            </p>
          )}
          
          {product.lumen && (
            <p className={styles.specs}>
              {product.lumen} лм {product.color_temp || 'нейтральный белый свет'}
            </p>
          )}

          <span className={styles.badge}>✅ Без пульсации</span>

          <span className={styles.price}>{formatPrice(product.price)} ₽</span>

          {isInStock && (
            <>
              <div className={styles.quantitySection}>
                <span className={styles.quantityLabel}>Количество:</span>
                <div className={styles.quantityControl}>
                  <button onClick={decreaseQuantity} disabled={quantity <= 1}>−</button>
                  <span>{quantity}</span>
                  <button onClick={increaseQuantity} disabled={quantity >= product.stock}>+</button>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.cartBtn} onClick={handleAddToCart}>
                  🛒 В корзину
                </button>
                <button className={styles.quickBuyBtn}>
                  Купить в 1 клик
                </button>
              </div>
            </>
          )}

          <div className={styles.deliveryInfo}>
            <h4>🚚 Доставка</h4>
            <p>Самовывоз из магазина — бесплатно</p>
            <p>Доставка курьером — от 150 ₽</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;