// backend/src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/productos - Obtener todas los productos
router.get('/', productController.getProductos);

// GET /api/productos/category/:categoriaId - Obtener productos por categoría
//router.get('/category/:categoriaId', productController.getProductsByCategory);

// GET /api/productos/:productId - Obtener detalle de un producto
router.get('/:productId', productController.getProductDetail);

module.exports = router;