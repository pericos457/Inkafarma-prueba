import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ProductForm.css';

const initialData = {
  nombre: '',
  precio: '',
  descripcion: '',
  stock: ''  // Agregado el campo stock
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/productos/${id}`)
        .then(res => {
          const { nombre, precio, descripcion, imagen_url, stock } = res.data;
          setFormData({
            nombre: nombre || '',
            precio: precio != null ? precio : '',
            descripcion: descripcion || '',
            imagen_url: imagen_url || '',
            stock: stock || ''  // Recuperando stock
          });
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!formData.nombre.trim()) {
      errs.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      errs.nombre = 'Debe tener al menos 3 caracteres';
    }
    if (!formData.precio) {
      errs.precio = 'El precio es requerido';
    } else if (isNaN(formData.precio) || Number(formData.precio) <= 0) {
      errs.precio = 'Debe ser un número mayor que 0';
    }
    if (formData.descripcion.length > 200) {
      errs.descripcion = 'Máximo 200 caracteres';
    }
    // Validación de stock
    if (isNaN(formData.stock) || Number(formData.stock) < 0) {
      errs.stock = 'El stock debe ser un número mayor o igual a 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    // Datos a enviar
    const formDataToSend = new FormData();
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('precio', Number(formData.precio));
    formDataToSend.append('descripcion', formData.descripcion || null);
    formDataToSend.append('stock', Number(formData.stock));  // Agregar stock aquí

    if (formData.imagen) {
      formDataToSend.append('imagen', formData.imagen);
    }

    try {
      if (id) {
        await api.put(`/productos/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Producto actualizado con éxito');
      } else {
        await api.post('/productos', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Producto creado con éxito');
        setFormData(initialData);
      }

      setTimeout(() => navigate('/productos'), 1000);
    } catch (error) {
      console.error(error);
      setMessage('Error al procesar la solicitud');
    }
  };

  return (
    <div className="product-form-container">
      <h2>{id ? 'Editar Producto' : 'Crear Producto'}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.nombre ? 'error' : ''}`}>
          <label htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
        </div>

        <div className={`form-group ${errors.precio ? 'error' : ''}`}>
          <label htmlFor="precio">Precio *</label>
          <input
            id="precio"
            name="precio"
            type="number"
            step="0.01"
            value={formData.precio}
            onChange={handleChange}
          />
          {errors.precio && <span className="error-message">{errors.precio}</span>}
        </div>

        <div className={`form-group ${errors.descripcion ? 'error' : ''}`}>
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            maxLength="200"
            rows="4"
            value={formData.descripcion}
            onChange={handleChange}
          />
          {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
        </div>

        <div className={`form-group ${errors.stock ? 'error' : ''}`}>
          <label htmlFor="stock">Stock *</label>
          <input
            id="stock"
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
          />
          {errors.stock && <span className="error-message">{errors.stock}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="imagen">Imagen</label>
          {formData.imagen_url && (
            <div>
              <p>Imagen actual:</p>
              <img
                src={`http://localhost:3000/${formData.imagen_url}`}
                alt="Imagen del producto"
                style={{ width: '150px', height: 'auto', marginBottom: '10px' }}
              />
            </div>
          )}
          <input
            id="imagen"
            name="imagen"
            type="file"
            onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })}
          />
        </div>

        <div className="button-group">
          <button type="submit">{id ? 'Actualizar' : 'Guardar'}</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/productos')}
          >
            Cancelar
          </button>
        </div>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
}
