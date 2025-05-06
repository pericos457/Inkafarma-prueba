// server.js
//importamos las dependencias
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routers/productRouters');
const clientRouter = require('./routers/clientRouters');  
const purchaseRouter = require('./routers/purchaseRouters');  

class Server { //clase para encapsular la condiguracion y l arranque del servidor
  
  constructor() {
    this.app = express(); 
    this.config();
    this.routes();
  }

  config() { // metodo config
    this.app.use(express.json());
    this.app.use(cors());

     // Servir archivos estáticos desde la carpeta "uploads"
    const path = require('path');
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  }

  routes() {// metodo routers
    this.app.use('/productos', productRoutes);
    this.app.use('/clientes', clientRouter); 
    this.app.use('/compras', purchaseRouter); 
  }

  start() { // metodo start

    const PORT = process.env.PORT || 3000;
    this.app.listen(PORT, () => { 
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  }
}

const server = new Server();
server.start(); 

