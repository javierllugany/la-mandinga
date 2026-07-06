// backend/src/routes/catalogoRoutes.js
const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogoController');

// GET /api/catalogo - Obtener todas los productos del catalogo
router.get('/', catalogoController.getCatalogo);

// GET /api/catalogo/category/:categoriaId - Obtener productos por categoría
//router.get('/category/:categoriaId', catalogoController.getCategoriesWithCatalogo);

// GET /api/catalogo/:catalogoId - Obtener detalle de un producto del catalogo
router.get('/:catalogoId', catalogoController.getCatalogoDetail);

// POST /api/catalogo - Crear nuevo producto en el catalogo
//router.post('/', catalogoController.createCatalogo);

// PUT /api/catalogo/:id - Actualizar producto del catalogo existente
//router.put('/:id', catalogoController.updateCatalogo);

// DELETE /api/catalogo/:id - Eliminar producto del catalogo
//router.delete('/:id', catalogoController.deleteCatalogo);

module.exports = router;