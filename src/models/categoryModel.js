const { pool } = require('../config/database');

// Obtener todas las categorías
const getAllCategories = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id, 
                nombre, 
                descripcion, 
                image_url
            FROM categorias 
            ORDER BY nombre
        `);
        return rows;
    } catch (error) {
        throw error;
    }
};

// // Obtener categoría por ID
// const getCategoryById = async (id) => {
//     try {
//         const [rows] = await pool.query(
//             `SELECT 
//                 id, 
//                 nombre,
//                 descripcion,
//                 image_url as imageUrl,
//                 creado_en as createdAt
//             FROM categorias 
//             WHERE id = ?`,
//             [id]
//         );
//         return rows[0];
//     } catch (error) {
//         throw error;
//     }
// };

// Crear nueva categoría
const createCategory = async (categoryData) => {
    try {
        const { nombre, descripcion, image_url } = categoryData;
        const [result] = await pool.query(
            `INSERT INTO categorias (nombre, descripcion, image_url) 
             VALUES (?, ?, ?)`,
            [nombre, descripcion, image_url || null]
        );
        
        // Obtener la categoría creada
        const newCategory = await getCategoryById(result.insertId);
        return newCategory;
    } catch (error) {
        throw error;
    }
};

// Actualizar categoría
const updateCategory = async (id, categoryData) => {
    try {
        const { nombre, descripcion, image_url } = categoryData;
        const [result] = await pool.query(
            `UPDATE categorias 
             SET nombre = ?, descripcion = ?, image_url = ? 
             WHERE id = ?`,
            [nombre, descripcion, image_url || null, id]
        );
        
        if (result.affectedRows === 0) {
            return null;
        }
        
        return await getCategoryById(id);
    } catch (error) {
        throw error;
    }
};

// Eliminar categoría
const deleteCategory = async (id) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM categorias WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};

// Obtener productos por categoría
// const getProductsByCategory = async (categoryId) => {
//     try {
//         const [rows] = await pool.query(
//             `SELECT 
//                 id,
//                 producto,
//                 categoria_id,
//                 proveedor_id,
//                 precio_base as precioBase,
//                 cantidad,
//                 origen,
//                 creado_en as createdAt,
//                 actualizado_en as updatedAt
//             FROM productos 
//             WHERE categoria_id = ?
//             ORDER BY producto`,
//             [categoryId]
//         );
//         return rows;
//     } catch (error) {
//         throw error;
//     }
// };

module.exports = {
    getAllCategories,
    //getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    //getProductsByCategory
};