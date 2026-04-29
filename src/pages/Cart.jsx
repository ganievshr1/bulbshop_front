import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h2>🛒 Корзина пуста</h2>
          <button onClick={() => navigate('/catalog')}>Перейти в каталог</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Корзина</h1>
      
      <div className="cart-items-list">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-image">💡</div>
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <div className="cart-item-sku">Арт. {item.id}</div>
              <div className="cart-item-badge">Без пульсации</div>
            </div>
            <div className="cart-item-price">{item.price.toLocaleString()} ₽</div>
            <div className="cart-item-quantity">
              <button 
                className="quantity-btn-sm" 
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >−</button>
              <span className="quantity-value">{item.quantity}</span>
              <button 
                className="quantity-btn-sm" 
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >+</button>
            </div>
            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Уд.</button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <span className="total-label">Итого:</span>
        <span className="total-price">{getTotalPrice().toLocaleString()} ₽</span>
        <span className="total-delivery">(включая доставку)</span>
      </div>
      
      <div className="cart-buttons">
        <button className="continue-shopping" onClick={() => navigate('/catalog')}>
          ← Продолжить покупки
        </button>
        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
          Оформить заказ →
        </button>
      </div>
    </div>
  );
};

export default Cart;