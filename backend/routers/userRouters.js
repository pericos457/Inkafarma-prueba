const express = require('express');
const router = express.Router();
const controllerUser = require('../controllers/controllerUser');

router.post('/login', controllerUser.login);
router.post('/register', controllerUser.register); 

module.exports = router;
