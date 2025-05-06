// models/productModel.js
const db = require('../config/db');

class ProductModel {
  async getAllProducts() {
    const result = await db.query('SELECT * FROM producto');
    return result.rows;
  }

  async getProductById(id) {
    const result = await db.query('SELECT * FROM producto WHERE id = $1', [id]);
    return result.rows[0];
  }

  async createProduct({ nombre, precio, descripcion, imagen_url }) {
    console.log('Datos que llegan al modelo:', { nombre, precio, descripcion, imagen_url });
    const result = await db.query(
      'INSERT INTO producto (nombre, precio, descripcion, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, precio, descripcion, imagen_url]
    );
    console.log('Producto creado:', result.rows[0]);
    return result.rows[0];
  }

  async updateProduct(id, { nombre, precio, descripcion, imagen_url }) {
    const result = await db.query(
      'UPDATE producto SET nombre = $1, precio = $2, descripcion = $3, imagen_url =$4 WHERE id = $5 RETURNING *',
      [nombre, precio, descripcion, imagen_url, id]
    );
    return result.rows[0];
  }

  async deleteProduct(id) {
    await db.query('DELETE FROM producto WHERE id = $1', [id]);
  }

  
  async searchProductsByName(query) {
    try {
      const result = await pool.query(
        'SELECT * FROM producto WHERE nombre ILIKE $1',
        [`%${query}%`]  // Utilizando ILIKE para una búsqueda insensible a mayúsculas
      );
      return result.rows;
    } catch (error) {
      console.error('Error en la búsqueda de productos:', error);
      throw new Error('Error al buscar productos');
    }
  }
}

module.exports = new ProductModel();
