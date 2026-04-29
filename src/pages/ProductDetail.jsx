import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const data = await getProductById(id);
    setProduct(data);
    setLoading(false);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (product && product.stock >= quantity) {
      addToCart(product, quantity);
      alert(`✅ ${product.name} добавлен в корзину!`);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!product) return <div className="error">Товар не найден</div>;

  return (
    <div className="product-detail-page">
      <div className="product-detail-card">
        <div className="product-image-section">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="image-placeholder">💡</div>
          )}
        </div>
        
        <div className="product-info-section">
          <div className="sku">Арт. {product.id}</div>
          <h1>{product.name}</h1>
          <div className="specs-text">
            {product.power_watt && `${product.power_watt} Вт`}
            {product.socket_type && ` • ${product.socket_type}`}
            {product.lumen && ` • ${product.lumen} лм`}
          </div>
          <div className="specs-text">
            {product.color_temp_k && `${product.color_temp_k}K`}
            {product.color_temp_k === 2700 && ' тёплый белый'}
            {product.color_temp_k === 4000 && ' нейтральный белый'}
            {product.color_temp_k === 6500 && ' холодный белый'}
          </div>
          <div className="badge">✅ Без пульсации</div>
          <div className="price">{product.price.toLocaleString()} ₽</div>
          
          <div className="quantity-row">
            <label>Количество:</label>
            <div className="quantity-controls">
              <button className="quantity-btn" onClick={decreaseQuantity}>−</button>
              <input className="quantity-input" value={quantity} readOnly />
              <button className="quantity-btn" onClick={increaseQuantity}>+</button>
            </div>
          </div>
          
          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              🛒 В корзину
            </button>
            <button className="one-click-btn">Купить в 1 клик</button>
          </div>
          
          <div className="delivery-box">
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