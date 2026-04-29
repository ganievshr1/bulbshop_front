import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  if (!order) {
    navigate('/catalog');
    return null;
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="success-icon">✅</div>
        <h1>Заказ успешно оформлен!</h1>
        
        <div className="order-number">
          <p>Номер заказа:</p>
          <h2>{order.order_number}</h2>
        </div>
        
        <div className="order-status">📋 Статус: ПРИНЯТ</div>
        
        <div className="order-items">
          {order.items?.map((item, idx) => (
            <div key={idx} className="order-item-row">
              <span>{item.product_name} × {item.quantity}</span>
              <span>{item.total_price.toLocaleString()} ₽</span>
            </div>
          ))}
        </div>
        
        <div className="order-final-total">
          <span>Итого:</span>
          <span>{order.total_amount?.toLocaleString()} ₽</span>
        </div>
        
        <button className="back-to-catalog" onClick={() => navigate('/catalog')}>
          ← Вернуться в каталог
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;