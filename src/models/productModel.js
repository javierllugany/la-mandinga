// backend/src/models/productModel.js
const { pool } = require('../config/database');

const getAllProducts = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.producto,
                p.categoria_id,
                p.proveedor_id,
                p.precio_base,
                p.cantidad,
                p.origen,
            FROM productos p
            ORDER BY p.producto
        `);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllProducts
};