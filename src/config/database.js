// backend/src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'la_mandinga',
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear un pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para obtener una conexión
async function getConnection() {
    return await pool.getConnection();
}

// Función para ejecutar queries
async function query(sql, params) {
    const [rows] = await pool.execute(sql, params || []);
    return rows;
}

// Función para probar la conexión
async function testConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos establecida');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a la base de datos:');
        console.error('  Mensaje:', error.message);
        return false;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    pool,
    getConnection,
    query,
    testConnection,
    dbConfig
};