import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './PurchaseList.css';

const DEBOUNCE_DELAY = 500;

export default function PurchaseList() {
  const [purchases, setPurchases] = useState([]);
  const [filterProductName, setFilterProductName] = useState('');
  const [filterClientDni, setFilterClientDni] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPurchases = useCallback(async (currentProductName, currentClientDni) => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (currentProductName.trim()) {
        params.productName = currentProductName.trim();
      }
      if (currentClientDni.trim()) {
        params.clientDni = currentClientDni.trim();
      }
      const { data } = await api.get('/compras/detalles', { params });
      setPurchases(data);
    } catch (err) {
      console.error("Error fetching purchase details:", err);
      setError('Error al cargar los detalles de las compras. Intente de nuevo.');
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases('', '');
  }, [fetchPurchases]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPurchases(filterProductName, filterClientDni);
    }, DEBOUNCE_DELAY);
    return () => {
      clearTimeout(handler);
    };
  }, [filterProductName, filterClientDni, fetchPurchases]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const params = new URLSearchParams();
      if (filterProductName.trim()) {
        params.append('productName', filterProductName.trim());
      }
      if (filterClientDni.trim()) {
        params.append('clientDni', filterClientDni.trim());
      }

      const response = await fetch(`http://localhost:3000/api/compras/generar-pdf?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('No se pudo generar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'reporte_compras.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Hubo un problema al generar el PDF.');
    }
  };

  return (
    <div className="list-container">
      <h2>Listado de Compras Registradas</h2>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="filterProductName">Filtrar por Producto:</label>
          <input
            type="text"
            id="filterProductName"
            value={filterProductName}
            onChange={(e) => setFilterProductName(e.target.value)}
            placeholder="Nombre del producto..."
            disabled={isLoading}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="filterClientDni">Filtrar por DNI Cliente:</label>
          <input
            type="text"
            id="filterClientDni"
            value={filterClientDni}
            onChange={(e) => setFilterClientDni(e.target.value)}
            maxLength="8"
            placeholder="DNI (8 dígitos)..."
            disabled={isLoading}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleGeneratePDF} disabled={isLoading}>
            Generar PDF
          </button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      {isLoading && <p className="loading-message">Cargando compras...</p>}

      {!isLoading && (
        <table className="data-table purchase-table">
          <thead>
            <tr>
              <th>Cod. Compra</th>
              <th>Fecha</th>
              <th>Cliente (DNI)</th>
              <th>Cliente (Nombre)</th>
              <th>Producto</th>
              <th>Precio Unit.</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length > 0 ? (
              purchases.map((item) => (
                <tr key={item.id}>
                  <td>{item.cod_compra}</td>
                  <td>{formatDate(item.fecha_compra)}</td>
                  <td>{item.cliente_dni}</td>
                  <td>{`${item.cliente_nombre || ''} ${item.cliente_apellido_pat || ''}`.trim()}</td>
                  <td>{item.producto_nombre}</td>
                  <td>S/ {Number(item.producto_precio).toFixed(2)}</td>
                  <td>{item.cantidad}</td>
                  <td>S/ {(Number(item.producto_precio) * item.cantidad).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                {!error && (
                  <td colSpan="8" style={{ textAlign: 'center' }}>
                    No se encontraron compras con los criterios seleccionados.
                  </td>
                )}
                {error && (
                  <td colSpan="8" style={{ textAlign: 'center' }}>-</td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
