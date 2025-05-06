const db = require('./config/db');

(async () => {
  try {
    // Ejecutamos una consulta simple para verificar la conexión a la BD
    const result = await db.query('SELECT NOW()');
    console.log('Conexión exitosa a la fecha y hora actual:', result.rows[0]);
  } catch (error) {
    console.error('Error de conexión:', error);
  }
})();



