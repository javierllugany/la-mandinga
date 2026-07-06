// backend/src/controllers/productController.js
const { pool } = require('../config/database');
const productModel = require('../models/productModel');

const productController = {
    // Obtener todas los productos
    async getProductos(req, res) {
        try {
            const productos = await productModel.getAllProducts();
            res.json({
                success: true,
                data: productos
            });
        } catch (error) {
            console.error('Error en getProductos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener los productos',
                error: error.message
            });
        }
    },

    // Obtener todas las categorías con sus productos
    async getCategoriesWithproductos(req, res) {
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
            
            // Obtener productos por categoría
            const result = [];
            for (const categoria of categorias) {
                const [productos] = await pool.query(
                    `SELECT 
                        id,
                        producto,
                        categoria_id,
                        proveedor_id,
                        precio_base,
                        cantidad,
                        origen,
                        creado_en,
                        actualizado_en,
                    FROM productos
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
                        categoria_id: p.categoria_id,
                        proveedor_id: p.proveedor_id,
                        precio_base: parseFloat(p.precio_base),
                        cantidad: parseInt(p.cantidad),
                        origen: p.origen,
                        creado_en: p.creado_en,
                        actualizado_en: p.actualizado_en
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

    // Obtener productos por categoría
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
                    categoria_id,
                    proveedor_id,
                    precio_base,
                    cantidad,
                    origen,
                    creado_en,
                    actualizado_en
                FROM productos
                WHERE categoria_id = ?
                ORDER BY nombre`,
                [categoriaId]
            );

            res.json({
                success: true,
                data: {
                    categoria_name: categoria[0].nombre,
                    productos: productos.map(p => ({
                        id: p.id,
                        producto: p.producto,
                        categoria_id: p.categoria_id,
                        proveedor_id: p.proveedor_id,
                        precio_base: parseFloat(p.precio_base),
                        cantidad: parseInt(p.cantidad),
                        origen: p.origen,
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

    // Obtener detalle de un producto específico
    async getProductDetail(req, res) {
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
                        categoria_id: p.categoria_id,
                        proveedor_id: p.proveedor_id,
                        precio_base: parseFloat(p.precio_base),
                        cantidad: parseInt(p.cantidad),
                        origen: p.origen,
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

module.exports = productController;
