// backend/src/models/catalogoModel.js
const { pool } = require('../config/database');

const getAllProducts = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                cat.id,
                cat.producto,
                cat.stock,
                cat.precioVentaX100gr,
                cat.origen,
                cat.categoria_id 
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