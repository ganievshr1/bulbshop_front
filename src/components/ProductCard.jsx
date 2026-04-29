import React from 'react';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image || '/placeholder.jpg'} alt={product.name} />
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-price">{product.price} ₽</p>
        <p className="product-description">{product.description}</p>
        <button onClick={() => onAddToCart(product)} className="add-to-cart-btn">
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
