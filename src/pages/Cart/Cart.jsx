import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import styles from './Cart.module.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h2>🛒 Корзина пуста</h2>
          <p>Добавьте товары из каталога</p>
          <button onClick={() => navigate('/catalog')}>Перейти в каталог</button>
        </div>
      </div>
    );
  }

  const totalPrice = Number(getTotalPrice()) || 0;

  const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? '0' : num.toLocaleString('ru-RU');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Корзина</h1>

      <div className={styles.itemsList}>
        {cart.map((item) => (
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
              <span className={styles.itemBadge}>Без пульсации</span>
            </div>

            <div className={styles.quantityControl}>
              <span className={styles.quantityLabel}>Кол-во:</span>
              <div className={styles.quantityButtons}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= (item.stock || 99)}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.itemPrice}>
              {formatPrice((Number(item.price) || 0) * Number(item.quantity))} ₽
            </div>

            <button
              className={styles.removeBtn}
              onClick={() => removeFromCart(item.id)}
            >
              Уд.
            </button>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.totalRow}>
          <span>Итого:</span>
          <span className={styles.totalPrice}>{formatPrice(totalPrice)} ₽</span>
          <span className={styles.totalNote}>(включая доставку)</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.continueBtn} onClick={() => navigate('/catalog')}>
          ← Продолжить покупки
        </button>
        <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
          Оформить заказ →
        </button>
      </div>
    </div>
  );
};

export default Cart;