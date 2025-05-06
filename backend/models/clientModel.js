const db = require('../config/db');

class ClientModel {
  async getAllClients() {
    const result = await db.query('SELECT * FROM cliente');
    return result.rows;
  }

  async getClientById(id) {
    const result = await db.query('SELECT * FROM cliente WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getClientByDni(dni) {
    const result = await db.query('SELECT * FROM cliente WHERE dni = $1', [dni]);
    return result.rows;
  }

  async createClient({ dni, nombre, apellido_pat, apellido_mat, telefono, direccion }) {
    const result = await db.query(
      'INSERT INTO cliente (dni, nombre, apellido_pat, apellido_mat, telefono, direccion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [dni, nombre, apellido_pat, apellido_mat, telefono, direccion]
    );
    return result.rows[0];
  }

  async updateClient(id, { dni, nombre, apellido_pat, apellido_mat, telefono, direccion }) {
    const result = await db.query(
      'UPDATE cliente SET dni = $1, nombre = $2, apellido_pat = $3, apellido_mat = $4, telefono = $5, direccion = $6 WHERE id = $7 RETURNING *',
      [dni, nombre, apellido_pat, apellido_mat, telefono, direccion, id]
    );
    return result.rows[0];
  }

  async deleteClient(id) {
    await db.query('DELETE FROM cliente WHERE id = $1', [id]);
  }
}

module.exports = new ClientModel();