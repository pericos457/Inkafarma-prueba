const upload = require('../middlewares/upload'); 

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Rutas de productos
router.get('/', (req, res) => productController.getProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));

// Usamos el middleware 'upload.single' para manejar la subida de una sola imagen
router.post('/', upload.single('imagen'), productController.createProduct);
router.put('/:id', upload.single('imagen'), productController.updateProduct);

router.delete('/:id', productController.deleteProduct);

router.get('/search', (req, res) => productController.searchProducts(req, res)); 

module.exports = router;
