// backend/src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categorias - Obtener todas las categorías
router.get('/', categoryController.getCategories);

// GET /api/categorias/:id - Obtener categoría por ID
//router.get('/:id', categoryController.getCategoryById);

// GET /api/categorias/:id/productos - Obtener productos de una categoría
//router.get('/:id/productos', categoryController.getCategoryProducts);

// POST /api/categorias - Crear nueva categoría
router.post('/', categoryController.createCategory);

// PUT /api/categorias/:id - Actualizar categoría
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categorias/:id - Eliminar categoría
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;