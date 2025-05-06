// controllers/productController.js
const productService = require('../services/productService');

class ProductController {

  async getProducts(req, res) {
    try {
      const products = await productService.getProducts();
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  }


    async getProductById(req, res) {
      const { id } = req.params;
      try {
        const product = await productService.getProductById(id);
        if (!product) {
          return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto' });
      }
    }

    async createProduct(req, res) {
      try {
        const { nombre, precio, descripcion } = req.body;
    
        // Verifica si la imagen se ha subido
        if (!req.file) {
          return res.status(400).json({ message: 'Se requiere una imagen para el producto' });
        }
    
        // Construye la URL de la imagen
        const imagen_url = `uploads/${req.file.filename}`;  // La URL relativa que se guardará en la base de datos
    
        // Llama al servicio para agregar el producto
        const newProduct = await productService.addProduct({ nombre, precio, descripcion, imagen_url });
        res.status(201).json(newProduct);
      } catch (error) {
        console.error('ERROR al crear producto:', error.message);
        res.status(500).json({ message: error.message });
      }
    }
    
    async updateProduct(req, res) {
      try {
        const { id } = req.params;
        const { nombre, precio, descripcion } = req.body;
    
        let imagen_url = null;
        if (req.file) {
          imagen_url = `uploads/${req.file.filename}`;
        }
    
        const updatedProduct = await productService.modifyProduct(id, { nombre, precio, descripcion, imagen_url });
        res.status(200).json(updatedProduct);
      } catch (error) {
        console.error('Error al actualizar el producto:', error.message);
        res.status(500).json({ message: error.message });
      }
    }
    

    async deleteProduct(req, res) {
      try {
        const { id } = req.params;
        await productService.removeProduct(id);
        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el producto' });
      }
    }

    async searchProducts(req, res) {
      const { query } = req.query;
      try {
        const products = await productService.searchProductsByName(query);
        res.json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al buscar productos' });
      }
    }
    
}

module.exports = new ProductController();
