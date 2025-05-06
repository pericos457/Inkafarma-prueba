const express = require('express');
const purchaseController = require('../controllers/purchaseController');

const router = express.Router();

router.get('/', purchaseController.getAllPurchases);
router.get('/detalles', purchaseController.getPurchaseDetails);
router.get('/:cod_compra', purchaseController.getPurchaseByCode);
router.post('/', purchaseController.createPurchase);
router.put('/:id', purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);


module.exports = router;