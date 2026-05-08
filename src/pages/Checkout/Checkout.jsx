import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectTotalPrice, clearCart } from '../../store/cartSlice';
import { placeOrder } from '../../store/ordersSlice';
import styles from './Checkout.module.css';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    comment: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    if (cart.length === 0) {
      alert('Корзина пуста');
      return;
    }

    setLoading(true);

    const orderData = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_email: formData.customer_email || null,
      delivery_address: formData.delivery_address,
      comment: formData.comment || null,
      payment_method: paymentMethod,
      items: cart.map((item) => ({
        product_id: Number(item.id),
        product_name: item.name,
        quantity: Number(item.quantity),
        price: Number(item.price) || 0,
        total_price: (Number(item.price) || 0) * Number(item.quantity),
      })),
      total_price: Number(totalPrice) || 0,
    };

    const result = await dispatch(placeOrder(orderData));

    if (result.payload && result.payload.success) {
      dispatch(clearCart());
      navigate('/order-conformation', { state: { order: result.payload.data } });
    } else {
      alert('Ошибка при оформлении заказа: ' + (result.payload?.error || 'Неизвестная ошибка'));
    }

    setLoading(false);
  };

  const formatPrice = (price) => {
    const num = Number(price);
    return isNaN(num) ? '0' : num.toLocaleString('ru-RU');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Оформление заказа</h1>

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>ФИО *</label>
            <input type="text" name="customer_name" value={formData.customer_name}
              onChange={handleChange} placeholder="Иванов Иван Иванович" required />
          </div>

          <div className={styles.formGroup}>
            <label>Телефон *</label>
            <input type="tel" name="customer_phone" value={formData.customer_phone}
              onChange={handleChange} placeholder="+7 (912) 345-67-89" required />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input type="email" name="customer_email" value={formData.customer_email}
              onChange={handleChange} placeholder="ivan@example.com" />
          </div>

          <div className={styles.formGroup}>
            <label>Адрес доставки *</label>
            <textarea name="delivery_address" value={formData.delivery_address}
              onChange={handleChange} placeholder="г. Уфа, ул. Ленина, д. 10, кв. 5" rows="3" required />
          </div>

          <div className={styles.formGroup}>
            <label>Способ оплаты</label>
            <div className={styles.paymentMethods}>
              <button type="button" className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.active : ''}`}
                onClick={() => setPaymentMethod('card')}>💳 Карта онлайн</button>
              <button type="button" className={`${styles.paymentOption} ${paymentMethod === 'cash' ? styles.active : ''}`}
                onClick={() => setPaymentMethod('cash')}>💰 Наличные при получении</button>
              <button type="button" className={`${styles.paymentOption} ${paymentMethod === 'online' ? styles.active : ''}`}
                onClick={() => setPaymentMethod('online')}>🏦 Оплата при получении</button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Оформление...' : '✅ Подтвердить заказ'}
          </button>
        </form>

        <div className={styles.orderSummary}>
          <h2>Ваш заказ</h2>
          <div className={styles.orderItems}>
            {cart.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice((Number(item.price) || 0) * Number(item.quantity))} ₽</span>
              </div>
            ))}
          </div>
          <div className={styles.orderTotal}>
            <span>Итого:</span>
            <span>{formatPrice(totalPrice)} ₽</span>
          </div>
          <p className={styles.totalNote}>Включая НДС и доставку</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;