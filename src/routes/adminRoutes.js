const express = require('express');
const router = express.Router();
const { reloadProducts } = require('../scripts/reloadProducts.js');

// Middleware para verificar que el usuario es administrador
// (Ajusta esto según tu sistema de autenticación)
const verificarAdmin = (req, res, next) => {
    // Aquí deberías verificar que el usuario tenga rol de administrador
    // Ejemplo con JWT:
    // const token = req.headers.authorization?.split(' ')[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (decoded.rol !== 'admin') {
    //     return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    // }
    // next();
    
    // TEMPORAL: Para pruebas, permitir acceso sin autenticación
    // IMPORTANTE: ¡Quita esto en producción!
    next();
};

// Endpoint para recargar productos
router.post('/admin/reload-products', verificarAdmin, async (req, res) => {
    try {
        console.log('🔄 Solicitado recarga de productos en BS desde el panel de administración');
        
        // Ejecutar el script de recarga
        const resultado = await reloadProducts();
        
        // Enviar respuesta
        res.json({
            success: true,
            message: resultado.mensaje,
            details: resultado.detalles
        });
        
    } catch (error) {
        console.error('❌ Error en endpoint /admin/reload-products:', error);
        res.status(500).json({
            success: false,
            message: 'Error al recargar los productos',
            error: error.message
        });
    }
});

// Endpoint para obtener el estado de la base de datos (opcional)
router.get('/admin/productos/stats', verificarAdmin, async (req, res) => {
    try {
        const db = require('../config/database'); // Ajusta según tu configuración
        const [countResult] = await db.query('SELECT COUNT(*) as total FROM productos');
        const [categoriasCount] = await db.query('SELECT COUNT(*) as total FROM categorias');
        const [proveedoresCount] = await db.query('SELECT COUNT(*) as total FROM proveedores');
        
        res.json({
            success: true,
            stats: {
                totalProductos: countResult[0].total,
                totalCategorias: categoriasCount[0].total,
                totalProveedores: proveedoresCount[0].total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas'
        });
    }
});

module.exports = router;