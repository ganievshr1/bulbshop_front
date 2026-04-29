import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems ? getTotalItems() : 0;
  
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <h1>💡 Завод лампочек</h1>
          </Link>
        </div>
        <nav>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/catalog">Каталог</Link></li>
            <li><Link to="/cart">Корзина 🛒 {itemCount > 0 && <span className="cart-count">{itemCount}</span>}</Link></li>
            <li><Link to="/admin">Админ</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;