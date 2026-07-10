// backend/src/controllers/catalogoController.js
const { pool } = require('../config/database');
const catalogoModel = require('../models/catalogoModel');

const catalogoController = {
    // Obtener todas los productos del catalogo
    async getCatalogo(req, res) {
        try {
            const productos = await catalogoModel.getAllProducts();
            res.json({
                success: true,
                data: productos
            });
        } catch (error) {
            console.error('Error en getCatalogo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los productos del catálogo',
                error: error.message
            });
        }
    },

    // Obtener todas las categorías con sus productos
    async getCategoriesWithCatalogo(req, res) {
        try {
            // Obtener categorías
            const [categorias] = await pool.query(`
                SELECT 
                    id,
                    nombre,
                    descripcion,
                    image_url
                FROM categorias
                ORDER BY nombre
            `);
            
            // Obtener productos del catalogo por categoría
            const result = [];
            for (const categoria of categorias) {
                const [productos] = await pool.query(
                    `SELECT 
                        id,
                        producto,
                        stock,
                        precioVenta,
                        origen,
                        categoria_id
                    FROM catalogo
                    WHERE categoria_id = ?
                    ORDER BY producto`,
                    [categoria.id]
                );
                
                result.push({
                    id: categoria.id,
                    nombre: categoria.nombre,
                    descripcion: categoria.descripcion,
                    image_url: categoria.image_url,
                    productos: productos.map(p => ({
                        id: p.id,
                        producto: p.producto,
                        stock: p.stock,
                        precioVenta: parseFloat(p.precioVenta),
                        origen: p.origen,
                        categoria_id: p.categoria_id,
                    }))
                })
            };

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    // Obtener productos del catalogo por categoría
    async getProductsByCategory(req, res) {
        try {
            const { categoriaId } = req.params;
            
            // Verificar que la categoría existe
            const [categoria] = await pool.query(
                'SELECT nombre FROM categorias WHERE id = ?',
                [categoriaId]
            );
            
            if (categoria.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada'
                });
            }

            const [productos] = await pool.query(
                    `SELECT 
                        id,
                        producto,
                        stock,
                        precioVenta,
                        origen,
                        categoria_id
                    FROM catalogo
                    WHERE categoria_id = ?
                    ORDER BY producto`,
                    [categoria.id]
            );

            res.json({
                success: true,
                data: {
                    categoria_name: categoria[0].nombre,
                    productos: productos.map(p => ({
                        id: p.id,
                        producto: p.producto,
                        stock: p.stock,
                        precioVenta: parseFloat(p.precioVenta),
                        origen: p.origen,
                        categoria_id: p.categoria_id,
                        creado_en: p.creado_en,
                        actualizado_en: p.actualizado_en
                    }))
                }
            });
        } catch (error) {
            console.error('Error al obtener productos por categoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    async searchCatalogo(req, res) {
        try {
            const { q } = req.query;
            if (!q || q.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro de búsqueda "q" es obligatorio'
                });
            }

            const [result] = await pool.query(
                `SELECT 
                    c.id,
                    c.producto,
                    c.stock,
                    c.precioVenta,
                    c.origen,
                    c.categoria_id,
                    cat.nombre AS categoria_name
                FROM catalogo c
                JOIN categorias cat ON c.categoria_id = cat.id
                WHERE c.producto LIKE ? OR c.origen LIKE ?
                ORDER BY c.producto`,
                [`%${q}%`, `%${q}%`]
            );

            res.json({
                success: true,
                data: result.map(p => ({
                    id: p.id,
                    producto: p.producto,
                    stock: p.stock,
                    precioVenta: parseFloat(p.precioVenta),
                    origen: p.origen,
                    categoria_id: p.categoria_id,
                    categoria_name: p.categoria_name
                }))
            });
        } catch (error) {
            console.error('Error al buscar productos en el catálogo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al realizar la búsqueda en el catálogo',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },

    // Obtener detalle de un producto específico
    async getCatalogoDetail(req, res) {
        try {
            const { productId } = req.params;

            const [productos] = await pool.query(
                `SELECT 
                    p.*,
                    c.nombre as categoria_name
                FROM productos p
                JOIN categorias c ON p.categoria_id = c.id
                WHERE p.id = ?`,
                [productId]
            );

            if (productos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            const product = productos[0];
            res.json({
                success: true,
                data: {
                        id: p.id,
                        producto: p.producto,
                        stock: p.stock,
                        precioVenta: parseFloat(p.precioVenta),
                        origen: p.origen,
                        categoria_id: p.categoria_id,
                        creado_en: p.creado_en,
                        actualizado_en: p.actualizado_en
                }
            });
        } catch (error) {
            console.error('Error al obtener detalle del producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener datos',
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
};

module.exports = catalogoController;
