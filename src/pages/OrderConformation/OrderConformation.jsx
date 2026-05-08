import { useLocation, useNavigate } from 'react-router-dom';
import styles from './OrderConformation.module.css';

const OrderConformation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    navigate('/catalog', { replace: true });
    return null;
  }

  const orderData = order.data || order;

  const formatPrice = (price) => {
    if (typeof price === 'object' && price !== null) {
      price = price.toString();
    }
    const num = parseFloat(price);
    return isNaN(num) ? '0' : num.toLocaleString('ru-RU');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.successIcon}>
          <span>✅</span>
        </div>

        <h1 className={styles.title}>Заказ успешно оформлен!</h1>

        <p className={styles.orderLabel}>Номер заказа:</p>
        <h2 className={styles.orderNumber}>{orderData.order_number}</h2>

        <div className={styles.statusBadge}>📋 Статус: ПРИНЯТ</div>

        <div className={styles.items}>
          {orderData.items?.map((item, idx) => (
            <div key={idx} className={styles.itemRow}>
              <span>{item.product_name} × {item.quantity}</span>
              <span>{formatPrice(item.total_price)} ₽</span>
            </div>
          ))}
        </div>

        <div className={styles.total}>
          <span>Итого:</span>
          <span>{formatPrice(orderData.total_price || orderData.total_amount)} ₽</span>
        </div>

        <button className={styles.backBtn} onClick={() => navigate('/catalog')}>
          ← Вернуться в каталог
        </button>
      </div>
    </div>
  );
};

export default OrderConformation;