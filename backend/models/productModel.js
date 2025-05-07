// models/productModel.js
const db = require('../config/db');

class ProductModel {
  
  async getAllProducts() {
    const result = await db.query('SELECT * FROM producto');
    return result.rows;
  }

  async getProductById(id) {
    const result = await db.query('SELECT * FROM producto WHERE id = $1', [id]);
    return result.rows[0];  // Retorna el primer producto encontrado
  }

  async createProduct({ nombre, precio, descripcion, imagen_url, stock }) {
    console.log('Datos que llegan al modelo:', { nombre, precio, descripcion, imagen_url, stock });

    // La validación de stock debe hacerse antes de llegar al modelo (en el controlador)
    const result = await db.query(
      'INSERT INTO producto (nombre, precio, descripcion, imagen_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, precio, descripcion, imagen_url, stock]
    );

    console.log('Producto creado:', result.rows[0]);
    return result.rows[0];
  }

  async updateProduct(id, { nombre, precio, descripcion, imagen_url, stock }) {
    // La validación de stock debe hacerse antes de llegar al modelo (en el controlador)
    const result = await db.query(
      'UPDATE producto SET nombre = $1, precio = $2, descripcion = $3, imagen_url = $4, stock = $5 WHERE id = $6 RETURNING *',
      [nombre, precio, descripcion, imagen_url, stock, id]
    );
    
    return result.rows[0];
  }

  async deleteProduct(id) {
    await db.query('DELETE FROM producto WHERE id = $1', [id]);
  }
}

module.exports = new ProductModel();
