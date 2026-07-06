// backend/src/controllers/categoryController.js
const categoryModel = require('../models/categoryModel');

// Obtener todas las categorías
const getCategories = async (req, res) => {
    try {
        const categorias = await categoryModel.getAllCategories();
        res.json({
            success: true,
            data: categorias
        });
    } catch (error) {
        console.error('Error en getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las categorías',
            error: error.message
        });
    }
};

// Obtener categoría por ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.getCategoryById(id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error en getCategoryById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la categoría',
            error: error.message
        });
    }
};

// Obtener productos de una categoría
const getCategoryProducts = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que la categoría existe
        const category = await categoryModel.getCategoryById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        const productos = await categoryModel.getProductsByCategory(id);
        res.json({
            success: true,
            data: {
                category,
                productos
            }
        });
    } catch (error) {
        console.error('Error en getCategoryProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos de la categoría',
            error: error.message
        });
    }
};

// Crear nueva categoría
const createCategory = async (req, res) => {
    try {
        const { nombre, descripcion, image_url } = req.body;
        
        // Validar campos requeridos
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es requerido'
            });
        }
        
        const newCategory = await categoryModel.createCategory({
            nombre,
            descripcion,
            image_url
        });
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: newCategory
        });
    } catch (error) {
        console.error('Error en createCategory:', error);
        
        // Manejar error de duplicado (UNIQUE constraint)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al crear la categoría',
            error: error.message
        });
    }
};

// Actualizar categoría
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, image_url } = req.body;
        
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es requerido'
            });
        }
        
        const updatedCategory = await categoryModel.updateCategory(id, {
            nombre,
            descripcion,
            image_url
        });
        
        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: updatedCategory
        });
    } catch (error) {
        console.error('Error en updateCategory:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Ya existe una categoría con ese nombre'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la categoría',
            error: error.message
        });
    }
};

// Eliminar categoría
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await categoryModel.deleteCategory(id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error en deleteCategory:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la categoría',
            error: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    getCategoryProducts,
    createCategory,
    updateCategory,
    deleteCategory
};