const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      user: 'postgres',         // Usuario de PostgreSQL 
      host: 'localhost',      // 'localhost' si mapeaste el puerto 5432 en Docker
      database: 'inkafarma',   // Nombre de la base de datos
      password: 'admin123', // Contraseña de la Base de datos
      port: 5432,             // Puerto por defecto de PostgreSQL
    });
  }

  query(text, params) {
    return this.pool.query(text, params);
  }
}

module.exports = new Database();

