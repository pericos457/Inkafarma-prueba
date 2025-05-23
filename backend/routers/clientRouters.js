const express = require('express');
const clientController = require('../controllers/clientController');

const router = express.Router();

router.get('/reniec/:dni', clientController.getReniecData);
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;