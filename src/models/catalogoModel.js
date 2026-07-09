// backend/src/models/catalogoModel.js
const { pool } = require('../config/database');

const getAllProducts = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                cat.id,
                cat.producto,
                cat.stock,
                cat.precioVenta,
                cat.unidad,
                cat.origen,
                cat.categoria_id, 
                cat.resaltado
            FROM catalogo cat
            ORDER BY cat.producto
        `);
        return rows;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllProducts
};