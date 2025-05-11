import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ClientForm.css';

const initialData = {
  dni: '',
  nombre: '',
  apellido_pat: '',
  apellido_mat: '',
  telefono: '',
  direccion: ''
};

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReniecLoading, setIsReniecLoading] = useState(false);
  const [reniecError, setReniecError] = useState('');
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      api.get(`/clientes/${id}`)
        .then(res => {
          const clientData = res.data;
          setFormData({
            dni: clientData.dni || '',
            nombre: clientData.nombre || '',
            apellido_pat: clientData.apellido_pat || '',
            apellido_mat: clientData.apellido_mat || '',
            telefono: clientData.telefono || '',
            direccion: clientData.direccion || ''
          });
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error fetching client data:", err);
          setMessage('Error al cargar los datos del cliente.');
          setIsLoading(false);
        });
    } else {
      setFormData(initialData);
      setErrors({});
      setMessage('');
      setReniecError('');
    }
  }, [id, isEditing]);

  const validate = () => {
    const errs = {};
    if (!formData.dni.trim()) {
      errs.dni = 'El DNI es requerido';
    } else if (!/^\d{16}$/.test(formData.dni.trim())) {
      errs.dni = 'El DNI debe ser numéricos';
    }
    if (formData.telefono && formData.telefono.trim() && !/^\d{7,9}$/.test(formData.telefono.trim())) {
      errs.telefono = 'El teléfono debe tener entre 7 y 9 dígitos.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
   
    if (name === 'dni') {
      setReniecError('');
    }

    setMessage('');
  };


  const handleDniBlur = useCallback(async () => {

    if (isEditing || !/^\d{16}$/.test(formData.dni.trim())) {
      if (!isEditing) {
        setFormData(prev => ({ ...prev, nombre: '', apellido_pat: '', apellido_mat: '' }));
        setReniecError(''); 
      }
      return;
    }
 

    console.log("handleDniBlur: DNI válido y no en edición. Iniciando consulta RENIEC...");

    setIsReniecLoading(true);
    setReniecError('');
    setMessage('');
    setErrors(prev => ({ ...prev, dni: undefined }));
    setFormData(prev => ({ ...prev, nombre: '', apellido_pat: '', apellido_mat: '' }));

    try {
      const response = await api.get(`/clientes/reniec/${formData.dni.trim()}`);
      console.log("handleDniBlur: Respuesta RENIEC recibida:", response.data);
      const { nombre, apellido_pat, apellido_mat } = response.data;
      setFormData(prev => ({
        ...prev,
        nombre: nombre || '',
        apellido_pat: apellido_pat || '',
        apellido_mat: apellido_mat || ''
      }));
    } catch (error) {
      console.error("handleDniBlur: Error fetching RENIEC data:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'No se pudo consultar RENIEC.';
      setReniecError(errorMessage); 
      setFormData(prev => ({ ...prev, nombre: '', apellido_pat: '', apellido_mat: '' }));
    } finally {
      setIsReniecLoading(false);
    }
  }, [formData.dni, isEditing]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setReniecError('');
    if (!validate()) return;

    if (reniecError && !isEditing) {
      if (!window.confirm(`Hubo un problema al consultar RENIEC (${reniecError}). ¿Desea guardar el cliente solo con DNI, teléfono y dirección?`)) {
        return;
      }
    }

    setIsLoading(true);
    const dataToSend = {
      dni: formData.dni.trim(),
      nombre: formData.nombre,
      apellido_pat: formData.apellido_pat,
      apellido_mat: formData.apellido_mat,
      telefono: formData.telefono.trim() || null,
      direccion: formData.direccion.trim() || null
    };

    try {
      let response;
      if (isEditing) {
        response = await api.put(`/clientes/${id}`, dataToSend);
        setMessage('Cliente actualizado con éxito');
      } else {
        response = await api.post('/clientes', dataToSend);
        setFormData(response.data);
        setMessage('Cliente creado con éxito');
      }
      setErrors({});
      setTimeout(() => navigate('/clientes'), 1500);

    } catch (error) {
      console.error(">>> ERROR en handleSubmit CATCH <<<");
      console.error("Objeto de error completo:", error);

      if (error.response) {
        console.log(">>> Error tiene 'error.response' <<<");
        console.log("Status Code recibido:", error.response.status);
        console.log("Data recibida:", error.response.data);

        const status = error.response.status;
        const responseData = error.response.data;
        const backendMessage = responseData?.message;

        if (status === 409) {
          console.log(">>> DETECTADO Status 409 <<<");
          const errorMessage = backendMessage || 'El DNI ya está registrado (mensaje por defecto).';
          setErrors(prev => ({ ...prev, dni: errorMessage }));
          setMessage('');
        } else {
          console.log(`>>> Status NO es 409 (es ${status}) <<<`);
          const errorMessage = backendMessage || `Error ${status}: No se pudo procesar la solicitud (mensaje por defecto).`;
          setMessage(errorMessage);
          setErrors({});
        }
      } else if (error.request) {
        console.log(">>> Error tiene 'error.request' (sin respuesta) <<<");
        setMessage('No se pudo conectar con el servidor.');
        setErrors({});
      } else {
        console.log(">>> Error NO tiene 'error.response' ni 'error.request' <<<");
        setMessage(`Error inesperado en la solicitud: ${error.message}`);
        setErrors({});
      }
      console.log(">>> FIN CATCH <<<");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="client-form-container">
      <h2>{isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</h2>
      {message && <p className={`form-message ${message.toLowerCase().includes('error') || message.toLowerCase().includes('problema') || message.toLowerCase().includes('inesperado') ? 'error' : 'success'}`}>{message}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <div className={`form-group ${errors.dni || reniecError ? 'error' : ''}`}>
          <label htmlFor="dni">DNI *</label>
          <input
            id="dni"
            name="dni"
            type="text"
            value={formData.dni}
            onChange={handleChange}
            onBlur={handleDniBlur}
            maxLength="16"
            disabled={isEditing || isLoading || isReniecLoading}
            required
            aria-invalid={!!errors.dni || !!reniecError}
            aria-describedby={errors.dni ? "dni-error" : (reniecError ? "reniec-error" : undefined)}
          />
          {errors.dni && <span id="dni-error" className="error-message">{errors.dni}</span>}
          {isReniecLoading && <span className="loading-message">Consultando RENIEC...</span>}
          {reniecError && !errors.dni && <span id="reniec-error" className="error-message">{reniecError}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" value={formData.nombre} readOnly disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="apellido_pat">Apellido Paterno</label>
          <input id="apellido_pat" name="apellido_pat" type="text" value={formData.apellido_pat} readOnly disabled={isLoading} />
        </div>
        <div className="form-group">
          <label htmlFor="apellido_mat">Apellido Materno</label>
          <input id="apellido_mat" name="apellido_mat" type="text" value={formData.apellido_mat} readOnly disabled={isLoading} />
        </div>
        <div className={`form-group ${errors.telefono ? 'error' : ''}`}>
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            maxLength="9"
            disabled={isLoading || isReniecLoading}
            aria-invalid={!!errors.telefono}
            aria-describedby={errors.telefono ? "telefono-error" : undefined}
          />
          {errors.telefono && <span id="telefono-error" className="error-message">{errors.telefono}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <textarea
            id="direccion"
            name="direccion"
            rows="3"
            value={formData.direccion}
            onChange={handleChange}
            disabled={isLoading || isReniecLoading}
          />
        </div>
        <div className="button-group">
          <button type="submit" disabled={isLoading || isReniecLoading}>
            {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar Cliente' : 'Guardar Cliente')}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/clientes')}
            disabled={isLoading || isReniecLoading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}