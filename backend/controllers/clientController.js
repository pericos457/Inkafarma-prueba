const clientService = require('../services/clientService');
const reniecService = require('../services/reniecService');

class ClientController {
  async getClients(req, res) {
    const { dni } = req.query;

    try {
      let clients;
      if (dni) {
        console.log(`Buscando cliente por DNI (query): ${dni}`);
        clients = await clientService.findClientByDni(dni);
        console.log(`Resultado búsqueda por DNI:`, clients);
      } else {
        console.log("Obteniendo todos los clientes (sin DNI en query)");
        clients = await clientService.getClients();
      }
      res.json(clients);
    } catch (error) {
      console.error("Error en getClients controller:", error);
      res.status(500).json({ message: 'Error al obtener los clientes' });
    }
  }

  async getClientById(req, res) {
    try {
      const { id } = req.params;
      const client = await clientService.getClientById(id);
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      res.json(client);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener el cliente' });
    }
  }

  async getReniecData(req, res) {
    const { dni } = req.params;
    console.log(`Consulta RENIEC solicitada para DNI: ${dni}`);

    if (!dni || !/^\d{8}$/.test(dni)) {
      console.log('DNI inválido para consulta RENIEC:', dni);
      return res.status(400).json({ message: 'DNI inválido. Debe tener 8 dígitos.' });
    }

    try {
      const data = await reniecService.getReniecDataByDni(dni);
      if (data) {
        console.log('Datos RENIEC encontrados para DNI:', dni, data);
        res.json({
          nombre: data.nombres || '',
          apellido_pat: data.apellidoPaterno || '',
          apellido_mat: data.apellidoMaterno || ''
        });
      } else {
        console.warn(`No se encontraron datos en RENIEC para DNI: ${dni}`);
        res.status(404).json({ message: 'DNI no encontrado en RENIEC o servicio no disponible.' });
      }
    } catch (error) {
      console.error(`Error al consultar RENIEC para DNI ${dni}:`, error.message);
      res.status(500).json({ message: 'Error al consultar el servicio de RENIEC.' });
    }
  }

   async createClient(req, res) {
    const { dni, nombre: nombreFrontend, apellido_pat: apPatFrontend, apellido_mat: apMatFrontend, telefono, direccion } = req.body;

    console.log('Recibido en createClient:', req.body);

    if (!dni || !/^\d{8}$/.test(dni)) {
      console.log('Error: DNI inválido o faltante en la solicitud.');
      return res.status(400).json({ message: 'El DNI es requerido y debe tener 8 dígitos.' });
    }

    let nombreFinal = nombreFrontend || '';
    let apellidoPatFinal = apPatFrontend || '';
    let apellidoMatFinal = apMatFrontend || '';

    try {
      console.log('Consultando RENIEC (en createClient) para DNI:', dni);
      const reniecData = await reniecService.getReniecDataByDni(dni);
      console.log('Respuesta RENIEC (en createClient):', reniecData);

      if (reniecData) {
        nombreFinal = reniecData.nombres || '';
        apellidoPatFinal = reniecData.apellidoPaterno || '';
        apellidoMatFinal = reniecData.apellidoMaterno || '';
        console.log(`Datos RENIEC procesados (en createClient):`, { nombre: nombreFinal, apellido_pat: apellidoPatFinal, apellido_mat: apellidoMatFinal });
      } else {
        console.warn(`No se pudieron obtener datos de RENIEC para el DNI ${dni} durante la creación. Se usarán los datos del frontend si existen.`);

      }

      const newClientData = {
        dni: dni.trim(),
        nombre: nombreFinal,
        apellido_pat: apellidoPatFinal,
        apellido_mat: apellidoMatFinal,
        telefono: telefono ? telefono.trim() : null,
        direccion: direccion ? direccion.trim() : null
      };
      console.log('Datos finales a insertar en BD (createClient):', newClientData);

      const newClient = await clientService.addClient(newClientData);
      console.log('Cliente creado exitosamente en BD (createClient):', newClient);

      res.status(201).json(newClient);

    } catch (error) {
      console.error('Mensaje:', error.message);
      if (error.code) console.error('Código Error BD (pg):', error.code);
      if (error.constraint) console.error('Constraint violado (pg):', error.constraint);
      if (error.detail) console.error('Detalle Error BD (pg):', error.detail);
      console.error('*');

      if (error.code === '23505') {
        console.log("Detectado DNI duplicado (error 23505), devolviendo 409.");
        return res.status(409).json({ message: 'El DNI ya está registrado' });
      }

      console.log("Error no es 23505, devolviendo 500.");
      res.status(500).json({ message: 'Error interno al crear el cliente' });
    }
  }

  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const { dni, nombre, apellido_pat, apellido_mat, telefono, direccion } = req.body;
      const updatedClient = await clientService.modifyClient(id, { dni, nombre, apellido_pat, apellido_mat, telefono, direccion });
      res.json(updatedClient);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar el cliente' });
    }
  }

  async deleteClient(req, res) {
    try {
      const { id } = req.params;
      await clientService.removeClient(id);
      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
  }
}

module.exports = new ClientController();