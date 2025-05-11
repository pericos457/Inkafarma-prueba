import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import './ProductList.css';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Función para obtener todos los productos
  const fetchProducts = async () => {
    setError('');
    try {
      const { data } = await api.get('/productos');
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError('Error al cargar los productos.');
    }
  };

  // Función para buscar productos según la consulta
  const fetchSearchedProducts = async (query) => {
    setError('');
    try {
      const { data } = await api.get(`/productos/search?query=${query}`);
      setProducts(data);
    } catch (err) {
      console.error('Error al buscar productos:', err);
      setError('Error al buscar productos.');
    }
  };

  // Función para manejar la eliminación de un producto
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    setDeletingId(id);
    setError('');

    try {
      await api.delete(`/productos/${id}`);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError('Error al eliminar el producto. Puede estar asociado a una compra.');
    } finally {
      setDeletingId(null);
    }
  };

  // UseEffect para cargar productos o hacer búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      fetchProducts();  // Muestra todos los productos cuando la búsqueda está vacía
    } else {
      fetchSearchedProducts(searchQuery);  // Realiza la búsqueda cuando hay texto
    }
  }, [searchQuery]);

  return (
    <div className="list-container">
      <h2>Productos</h2>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {/* Si prefieres mantener el botón */}
        <button
          className="btn btn-search"
          onClick={() => {
            if (searchQuery.trim() !== '') {
              fetchSearchedProducts(searchQuery);
            }
          }}
        >
          Buscar
        </button>
      </div>

      {/* Botón para agregar un nuevo producto */}
      <div className="add-button-container">
        <Link to="/productos/nuevo" className="btn btn-add">
          + Nuevo Producto
        </Link>
      </div>

      {/* Mostrar mensajes de error */}
      {error && <p className="error-message">{error}</p>}

      {/* Tabla de productos */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th className="actions-column">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {product.imagen_url ? (
                    <img
                      src={`http://localhost:3000/${product.imagen_url}`}
                      alt={product.nombre}
                      style={{
                        width: 'auto',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                  ) : 'sin imagen'}
                </td>
                <td>{product.nombre}</td>
                <td>S/ {Number(product.precio).toFixed(2)}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <Link to={`/productos/${product.id}/editar`} className="btn btn-edit">
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-delete"
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? 'Borrando...' : 'Borrar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                {error || 'No hay productos registrados.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
