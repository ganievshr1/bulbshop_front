import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    comment: '',
  });

  const totalPrice = getTotalPrice();

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
      payment_method: paymentMethod,
      comment: formData.comment || null,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };
    
    try {
      const result = await createOrder(orderData);
      clearCart();
      navigate('/order-confirmation', { state: { order: result } });
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>
      
      <div className="checkout-grid">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label>ФИО *</label>
            <input
              type="text"
              required
              placeholder="Иванов Иван Иванович"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Телефон *</label>
            <input
              type="tel"
              required
              placeholder="+7 (912) 345-67-89"
              value={formData.customer_phone}
              onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="ivan@example.com"
              value={formData.customer_email}
              onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Адрес доставки *</label>
            <textarea
              required
              rows="3"
              placeholder="г. Уфа, ул. Ленина, д. 10, кв. 5"
              value={formData.delivery_address}
              onChange={(e) => setFormData({...formData, delivery_address: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Способ оплаты</label>
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                💳 Карта онлайн
              </div>
              <div 
                className={`payment-option ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                💰 Наличные при получении
              </div>
            </div>
          </div>
          
          <div className="comment-field">
            <label>Комментарий</label>
            <textarea
              rows="3"
              placeholder="Позвонить за час до доставки"
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
            />
          </div>
        </form>
        
        <div className="order-summary">
          <h3>Ваш заказ</h3>
          {cart.map(item => (
            <div key={item.id} className="order-item">
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
            </div>
          ))}
          <div className="order-total">
            <span>Итого:</span>
            <span>{totalPrice.toLocaleString()} ₽</span>
          </div>
          <div className="order-total" style={{ fontSize: '12px', color: '#999', borderTop: 'none' }}>
            <span>Включая НДС и доставку</span>
          </div>
          <button 
            type="submit" 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Оформление...' : '✅ Подтвердить заказ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;