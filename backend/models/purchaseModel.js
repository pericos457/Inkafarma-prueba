const db = require('../config/db');

class PurchaseModel {
  async getAllPurchases() {
    const result = await db.query('SELECT * FROM compra');
    return result.rows;
  }

  async getPurchaseByCode(cod_compra) {
    const result = await db.query('SELECT * FROM compra WHERE cod_compra = $1', [cod_compra]);
    return result.rows[0];
  }

  async createPurchase({ cod_compra, cliente_id, producto_id, cantidad, fecha_compra }) {
    const result = await db.query(
      'INSERT INTO compra (cod_compra, cliente_id, producto_id, cantidad, fecha_compra) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cod_compra, cliente_id, producto_id, cantidad, fecha_compra]
    );
    return result.rows[0];
  }

  async createPurchaseWithDetails({ cod_compra, cliente_id, fecha_compra, productos }) {
    const client = await db.pool.connect(); 
    try {
      await client.query('BEGIN');

      const insertedRows = [];
      for (const producto of productos) {
        const result = await client.query(
          'INSERT INTO compra (cod_compra, cliente_id, producto_id, cantidad, fecha_compra) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [cod_compra, cliente_id, producto.producto_id, producto.cantidad, fecha_compra]
        );
        insertedRows.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return insertedRows;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en transacción createPurchaseWithDetails:', error);
      throw new Error('Error al insertar los detalles de la compra en la base de datos.');
    } finally {
      client.release();
    }
  }

  async updatePurchase(id, { cod_compra, cliente_id, producto_id, cantidad, fecha_compra}) {
    const result = await db.query(
      'UPDATE compra SET cod_compra = $1, cliente_id = $2, producto_id = $3, cantidad = $4, fecha_compra = $5 WHERE id = $6 RETURNING *',
      [cod_compra, cliente_id, producto_id, cantidad, fecha_compra, id]
    );
    return result.rows[0];
  }

  async deletePurchase(id) {
    await db.query('DELETE FROM compra WHERE id = $1', [id]);
  }

  async getPurchaseDetails(filters = {}) { 
    let query = `
      SELECT
        co.id,
        co.cod_compra,
        cl.dni AS cliente_dni,
        cl.nombre AS cliente_nombre,
        cl.apellido_pat AS cliente_apellido_pat,
        p.nombre AS producto_nombre,
        p.precio AS producto_precio,
        co.cantidad,
        co.fecha_compra
      FROM compra co
      JOIN cliente cl ON co.cliente_id = cl.id
      JOIN producto p ON co.producto_id = p.id
    `;

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (filters.clientDni) {
      conditions.push(`cl.dni = $${paramIndex}`);
      values.push(filters.clientDni);
      paramIndex++;
    }

    if (filters.productName) {
      conditions.push(`p.nombre ILIKE $${paramIndex}`);
      values.push(`%${filters.productName}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY co.fecha_compra DESC, co.cod_compra DESC, co.id ASC';

    console.log('Executing getPurchaseDetails Query:', query);
    console.log('With Values:', values);

    const result = await db.query(query, values);
    console.log('Resultados de la consulta getPurchaseDetails:', result.rows);
    return result.rows;
  }
}

module.exports = new PurchaseModel();