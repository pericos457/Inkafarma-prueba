import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './ClientList.css';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    setError('');
    try {
      const { data } = await api.get('/clientes');
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError('Error al cargar los clientes.');
    } finally {
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }
    setDeletingId(id);
    setError('');
    try {
      await api.delete(`/clientes/${id}`);
      setClients(prevClients => prevClients.filter(client => client.id !== id));
    } catch (err) {
      console.error("Error deleting client:", err);
      setError('Error al eliminar el cliente. Puede estar asociado a una compra.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <div className="list-container">
      <h2>Clientes</h2>
      <div className="add-button-container">
        <Link to="/clientes/nuevo" className="btn btn-add-client">
          + Nuevo Cliente
        </Link>
      </div>
      {error && <p className="error-message">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>DNI</th>
            <th>Nombre Completo</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th className="actions-column">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.length > 0 ? (
            clients.map(client => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td>{client.dni}</td>
                <td>{`${client.nombre || ''} ${client.apellido_pat || ''} ${client.apellido_mat || ''}`.trim()}</td>
                <td>{client.telefono}</td>
                <td>{client.direccion}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <Link
                      to={`/clientes/${client.id}/editar`}
                      className="btn btn-edit"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="btn btn-delete"
                      disabled={deletingId === client.id}
                    >
                      {deletingId === client.id ? 'Borrando...' : 'Borrar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              {!error && (
                <td colSpan="6" style={{ textAlign: 'center' }}>No hay clientes registrados.</td>
              )}
              {error && (
                <td colSpan="6" style={{ textAlign: 'center' }}>-</td>
              )}
            </tr>
          )}
        </tbody>
      </table>
      {/* )} */}
    </div>
  );
}