import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './stock.css';

export default function StockPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  // Cargar los productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/productos');
        setProducts(response.data);
      } catch (err) {
        setError('Error al cargar los productos');
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="stock-page">
      <h2>Stock de Productos</h2>
      {error && <p>{error}</p>}
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img
              src={`http://localhost:3000/${product.imagen_url}`}
              alt={product.nombre}
              style={{ width: '100px', height: 'auto', objectFit: 'cover' }}
            />
            <h3>{product.nombre}</h3>
            <p>Stock: {product.stock}</p>
            <p>Precio: S/ {product.precio}</p>
            {/* Aquí agregamos la descripción del producto */}
            <p>Descripción: {product.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
