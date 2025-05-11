import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Importa useNavigate para redirigir
import './Menu.css';
import logo from '../recursos/Inkafarma.png';

export default function Menu({ setToken }) {
  const navigate = useNavigate(); // Hook para redirigir al login

  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el token
    setToken(null); // Actualiza el estado del token en el componente principal
    navigate('/login'); // Redirige al login
  };

  return (
    <header className="menu-header">
      <NavLink to="/" className="menu-logo">
        <img src={logo} alt="logo Inkafarma" className="Inkafarma" />
      </NavLink>
      <nav className="menu-nav">
        <NavLink
          to="/productos"
          className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
        >
          Productos
        </NavLink>

        <NavLink
          to="/clientes"
          className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
        >
          Clientes
        </NavLink>

        <NavLink
          to="/compras"
          className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
        >
          Ver Compras
        </NavLink>

        <NavLink
          to="/compras/nuevo"
          className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
        >
          Nueva Compra
        </NavLink>

        <NavLink
          to="/stock"
          className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
        >
          Stock
        </NavLink>

        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
}
