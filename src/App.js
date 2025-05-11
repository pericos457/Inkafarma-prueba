import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Menu from './components/Menu';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import PurchaseForm from './components/PurchaseForm';
import PurchaseList from './components/PurchaseList';
import Slider from './components/Slider';
import Login from './components/login';
import Register from './components/register';
import StockPage from './components/Stocklist';  // Importa el componente de stock
import imagen1 from './assets/portada1.jpg';
import imagen2 from './assets/portada3.png';
import imagen3 from './assets/portada4.png';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const images = [imagen1, imagen2, imagen3];

  return (
    <div>
      {token && <Menu setToken={setToken} />}  {/* El menú sigue visible cuando el usuario está autenticado */}
      <main className="app-container">
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/" /> : <Login setToken={setToken} />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/"
            element={
              token ? (
                <div>
                  <Slider images={images} />
                  <center><p>¡Explora nuestros productos y servicios!</p></center>
                  <StockPage /> {/* Mostramos StockPage en la ruta principal */}
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/productos" element={<ProductList />} />
          <Route path="/productos/nuevo" element={<ProductForm />} />
          <Route path="/productos/:id/editar" element={<ProductForm />} />
          <Route path="/clientes" element={<ClientList />} />
          <Route path="/clientes/nuevo" element={<ClientForm />} />
          <Route path="/clientes/:id/editar" element={<ClientForm />} />
          <Route path="/compras" element={<PurchaseList />} />
          <Route path="/compras/nuevo" element={<PurchaseForm />} />
          
          {/* Ruta de Stock, accesible desde el menú */}
          <Route path="/stock" element={<StockPage />} />

          <Route path="*" element={<h1>Página no encontrada</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
