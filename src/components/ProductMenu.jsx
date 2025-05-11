import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ producto }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', width: '200px', margin: '1rem' }}>
      <img
        src={`http://localhost:3000/${producto.imagen_url}`} // Ajusta el puerto si es necesario
        alt={producto.nombre}
        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
      />
      <h3>{producto.nombre}</h3>
      <p>{producto.descripcion}</p>
      <p><strong>S/ {producto.precio}</strong></p>
      <Link to={`/productos/${producto.id}/editar`}>
        <button>Editar</button>
      </Link>
    </div>
  );
}

export default ProductCard;
