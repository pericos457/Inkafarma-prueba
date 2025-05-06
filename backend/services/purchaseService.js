const purchaseModel = require('../models/purchaseModel');

class PurchaseService {
  async getAllPurchases() {
    return await purchaseModel.getAllPurchases();
  }

  async getPurchaseByCode(cod_compra) {
    return await purchaseModel.getPurchaseByCode(cod_compra);
  }

  async addPurchase(data) {
    return await purchaseModel.createPurchase(data);
  }

  async modifyPurchase(id, data) {
    return await purchaseModel.updatePurchase(id, data);
  }

  async removePurchase(id) {
    return await purchaseModel.deletePurchase(id);
  }

  async getPurchaseDetails(filters = {}) {
    const details = await purchaseModel.getPurchaseDetails(filters);
    return details;
  }

  async addPurchaseWithDetails(purchaseData) {
    return await purchaseModel.createPurchaseWithDetails(purchaseData);
  }

}

module.exports = new PurchaseService();