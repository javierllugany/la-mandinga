require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();

const cors = require('cors');
const helmet = require('helmet');

// anular en PRODUCCION y activar en DESARROLLO
//const adminRoutes = require('./routes/adminRoutes');

const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const emailRoutes = require('./routes/emailRoutes');
//const { testConnection } = require('./config/database');

const db = require('./config/database');

// app.use(cors({
    //     origin: 'http:localhost:3000', //el frontend
    //     methods: ['GET','POST','PUT','DELETE'],
    //     allowedHeaders: ['Content-Type', 'Autorization']
    // }));
    
//Aplicar CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Lista blanca de dominios permitidos
    const allowedOrigins = [
      'http://localhost:3000',  //el frontend
      'https://iguanapop.net.ar/lamandinga',
      process.env.FRONTEND_URL
    ];
    
    // Permitir solicitudes sin origen (como Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Permite enviar cookies
  maxAge: 86400 // Cache preflight por 24 horas
};

app.use(cors(corsOptions));

// Middleware
// app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" }
// }));
app.use(express.json());


// ============================================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ============================================================

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
};

// Rutas
// anular en PRODUCCION y activar en DESARROLLO
//app.use('/api/admin', adminRoutes);

app.use('/api/productos', productRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/email', emailRoutes); 

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor La Mandinga API funcionando',
        timestamp: new Date().toISOString()
    });
});

// Ruta raíz
app.get('/api', (req, res) => {
    res.json({
        message: 'API La Mandinga',
        version: '1.0.0',
        endpoints: {
            admin:'/api',
            health: '/api/health',
            categorias: '/api/categorias',
            productos: '/api/productos'
        }
    });
});

// ============================================================
// ENDPOINT DE ESTADÍSTICAS - CORREGIDO
// ============================================================
app.get('/api/admin/productos/stats', async (req, res) => {
    console.log('📊 Obteniendo estadísticas...');
    let connection = null;
    
    try {
        // Crear conexión directa
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión establecida');
        
        // IMPORTANTE: Con mysql2/promise, query devuelve [rows, fields]
        const [productos] = await connection.query('SELECT COUNT(*) as total FROM productos');
        const [categorias] = await connection.query('SELECT COUNT(*) as total FROM categorias');
        const [proveedores] = await connection.query('SELECT COUNT(*) as total FROM proveedores');
        
        // Acceder a los datos correctamente
        const totalProductos = productos[0]?.total || 0;
        const totalCategorias = categorias[0]?.total || 0;
        const totalProveedores = proveedores[0]?.total || 0;
        
        console.log('📊 Resultados:', { totalProductos, totalCategorias, totalProveedores });
        
        res.json({
            success: true,
            stats: {
                totalProductos,
                totalCategorias,
                totalProveedores
            }
        });
        
    } catch (error) {
        console.error('❌ Error en stats:', error.message);
        console.error('  Stack:', error.stack);
        
        // Si hay error, devolver datos mock
        res.json({
            success: true,
            stats: {
                totalProductos: 1472777,
                totalCategorias: 384,
                totalProveedores: 57
            },
            warning: 'Usando datos mock debido a error: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada');
        }
    }
});

// ============================================================
// ENDPOINT DE PRUEBA
// ============================================================
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// ENDPOINT PARA RECARGAR PRODUCTOS - CORREGIDO
// ============================================================
app.post('/api/admin/reload-products', async (req, res) => {
    console.log('🔄 Solicitando recarga de productos...');
    
    try {
        const scriptPath = path.join(__dirname, '../src/scripts/reloadProducts.js');
        console.log('📂 Cargando script desde:', scriptPath);
        
        // Verificar que el archivo existe
        const fs = require('fs');
        if (!fs.existsSync(scriptPath)) {
            console.error('❌ El archivo no existe en:', scriptPath);
            return res.status(500).json({
                success: false,
                message: 'El script de recarga no se encuentra en la ruta esperada',
                path: scriptPath
            });
        }
        
        const { reloadProducts } = require(scriptPath);
        const resultado = await reloadProducts();
        
        res.json({
            success: true,
            message: resultado.mensaje || 'Productos recargados correctamente',
            details: resultado.detalles || {}
        });
        
    } catch (error) {
        console.error('❌ Error en reload-products:');
        console.error('  Mensaje:', error.message);
        console.error('  Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Error al recargar productos',
            error: error.message
        });
    }
});

// ============================================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================================
const frontendPath = path.join(__dirname, '../public');
app.use(express.static(frontendPath));

// ============================================================
// RUTAS HTML
// ============================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendPath, '/templates/admin.html'));
});

app.get('/adminProductos', (req, res) => {
    res.sendFile(path.join(frontendPath, '/templates/adminProductos.html'));
});

app.get('/adminStock', (req, res) => {
    res.sendFile(path.join(frontendPath, '/templates/adminStock.html'));
});

// ============================================================
// MANEJO DE ERRORES 404
// ============================================================
app.use((req, res) => {
    console.log(`❌ 404: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log(`📱 Página principal: http://localhost:${PORT}/`);
    console.log('='.repeat(50));
});
