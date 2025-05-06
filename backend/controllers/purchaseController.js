const purchaseService = require('../services/purchaseService');

class PurchaseController {
  async getAllPurchases(req, res) {
    try {
      const purchases = await purchaseService.getAllPurchases();
      res.json(purchases);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener las compras' });
    }
  }

  async getPurchaseByCode(req, res) {
    try {
      const { cod_compra } = req.params;
      const purchase = await purchaseService.getPurchaseByCode(cod_compra);
      if (!purchase) {
        return res.status(404).json({ message: 'Compra no encontrada' });
      }
      res.json(purchase);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener la compra' });
    }
  }


  async createPurchase(req, res) {
    const { cliente_id, productos } = req.body;

    if (!cliente_id || !productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ message: 'Datos incompletos: Se requiere cliente_id y un array de productos con producto_id y cantidad.' });
    }
    for (const prod of productos) {
      if (!prod.producto_id || !prod.cantidad || typeof prod.cantidad !== 'number' || prod.cantidad <= 0) {
        return res.status(400).json({ message: `Producto inválido en la lista: ${JSON.stringify(prod)}. Se requiere producto_id y cantidad positiva.` });
      }
    }

    try {
      const cod_compra = `C-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`; 

      const fecha_compra = new Date();

      const newPurchaseResult = await purchaseService.addPurchaseWithDetails({
        cod_compra,
        cliente_id,
        fecha_compra,
        productos 
      });

      res.status(201).json({ message: 'Compra registrada con éxito', cod_compra: cod_compra, details: newPurchaseResult });

    } catch (error) {
      console.error('Error detallado en createPurchase Controller:', error);
      res.status(500).json({ message: error.message || 'Error interno al registrar la compra completa.' });
    }
  }

  async updatePurchase(req, res) {
    try {
      const { id } = req.params;
      const { cod_compra, cliente_id, producto_id, cantidad, fecha_compra } = req.body;

      const updatedPurchase = await purchaseService.modifyPurchase(id, {
        cod_compra,
        cliente_id,
        producto_id,
        cantidad,
        fecha_compra,
      });

      if (!updatedPurchase) {
        return res.status(404).json({ message: 'Compra no encontrada' });
      }

      res.json(updatedPurchase);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar la compra' });
    }
  }

  async deletePurchase(req, res) {
    try {
      const { id } = req.params;
      await purchaseService.removePurchase(id);
      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar la compra' });
    }
  }

  async getPurchaseDetails(req, res) {
    try {
      const { productName, clientDni } = req.query;
      const filters = {};
      if (productName) filters.productName = productName;
      if (clientDni) filters.clientDni = clientDni;

      console.log("Filtros recibidos en getPurchaseDetails Controller:", filters);

      const details = await purchaseService.getPurchaseDetails(filters);
      res.json(details);
    } catch (error) {
      console.error("Error en getPurchaseDetails Controller:", error);
      res.status(500).json({ message: 'Error al obtener los detalles de las compras' });
    }
  }
}

module.exports = new PurchaseController();