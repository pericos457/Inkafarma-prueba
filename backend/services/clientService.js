const clientModel = require('../models/clientModel');

class ClientService {
  async getClients() {
    return await clientModel.getAllClients();
  }

  async getClientById(id) {
    return await clientModel.getClientById(id);
  }

   async findClientByDni(dni) {
    return await clientModel.getClientByDni(dni);
  }

  async addClient(data) {
    return await clientModel.createClient(data);
  }

  async modifyClient(id, data) {
    return await clientModel.updateClient(id, data);
  }

  async removeClient(id) {
    return await clientModel.deleteClient(id);
  }
}

module.exports = new ClientService();