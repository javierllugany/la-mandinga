const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// =============================================================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// =============================================================================
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'la_mandinga',
    port: process.env.DB_PORT, // 3306 es el Puerto por defecto de MariaDB
    multipleStatements: true  // Permite ejecutar múltiples sentencias SQL
};

// =============================================================================
// RUTA DEL ARCHIVO JSON - Ajusta según donde tengas tu archivo
// =============================================================================
const JSON_FILE_PATH = path.join(__dirname, '../data/catalogoCompleto.json');

// =============================================================================
// FUNCIÓN PARA LIMPIAR Y CONVERTIR UN VALOR A FLOAT
// =============================================================================
function parseFloatSafe(value) {
    if (value === null || value === undefined || value === '') {
        return 0.0;
    }
    // Si es string, reemplazar coma por punto para decimales
    if (typeof value === 'string') {
        // Reemplazar comas por puntos (formato europeo)
        const normalized = value.replace(',', '.');
        const parsed = parseFloat(normalized);
        return isNaN(parsed) ? 0.0 : parsed;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0.0 : parsed;
}

// =============================================================================
// FUNCIÓN PARA OBTENER MAPEOS DESDE LA BASE DE DATOS
// =============================================================================
async function obtenerMapeos(connection) {
    console.log('📥 Obteniendo mapeos de proveedores y categorías desde la base de datos...');
    
    // Obtener todos los proveedores
    const [proveedores] = await connection.query('SELECT id, nombre FROM proveedores');
    const proveedorMap = {};
    proveedores.forEach(p => {
        // Normalizar el nombre: eliminar espacios, convertir a minúsculas
        const nombreNormalizado = p.nombre.toLowerCase().trim();
        proveedorMap[nombreNormalizado] = p.id;
        // También guardar con el nombre exacto por si acaso
        proveedorMap[p.nombre] = p.id;
    });
    
    // Obtener todas las categorías
    const [categorias] = await connection.query('SELECT id, nombre FROM categorias');
    const categoriaMap = {};
    categorias.forEach(c => {
        // Normalizar el nombre: eliminar espacios, convertir a minúsculas
        const nombreNormalizado = c.nombre.toLowerCase().trim();
        categoriaMap[nombreNormalizado] = c.id;
        // También guardar con el nombre exacto por si acaso
        categoriaMap[c.nombre] = c.id;
    });
    
    console.log(`✅ Encontrados ${proveedores.length} proveedores y ${categorias.length} categorías`);
    
    // Mostrar los mapeos encontrados (útil para depuración)
    console.log('📋 Proveedores disponibles:', Object.keys(proveedorMap).join(', '));
    console.log('📋 Categorías disponibles:', Object.keys(categoriaMap).join(', '));
    
    return { proveedorMap, categoriaMap };
}

// =============================================================================
// FUNCIÓN PARA NORMALIZAR UN NOMBRE (eliminar acentos, espacios, etc.)
// =============================================================================
function normalizarNombre(nombre) {
    if (!nombre) return '';
    return nombre
        .toLowerCase()
        .trim()
        // Eliminar acentos (opcional, pero útil)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

// =============================================================================
// FUNCIÓN PARA BUSCAR UN ID EN UN MAPA CON VARIAS ESTRATEGIAS
// =============================================================================
function buscarIdEnMapa(nombre, mapa, tipo) {
    if (!nombre) {
        console.warn(`⚠️ ${tipo}: nombre vacío o nulo`);
        return null;
    }
    
    // Estrategia 1: Búsqueda exacta (nombre original)
    if (mapa[nombre] !== undefined) {
        return mapa[nombre];
    }
    
    // Estrategia 2: Búsqueda normalizada (sin acentos, minúsculas)
    const nombreNormalizado = normalizarNombre(nombre);
    if (mapa[nombreNormalizado] !== undefined) {
        return mapa[nombreNormalizado];
    }
    
    // Estrategia 3: Búsqueda parcial (contiene el nombre en alguna clave del mapa)
    // Esto es útil para casos como "mejorsinglutten" vs "mejorsingluten"
    const keys = Object.keys(mapa);
    for (const key of keys) {
        // Si el nombre normalizado está contenido en la clave o viceversa
        const keyNormalizada = normalizarNombre(key);
        if (nombreNormalizado.includes(keyNormalizada) || keyNormalizada.includes(nombreNormalizado)) {
            return mapa[key];
        }
    }
    
    // Estrategia 4: Búsqueda con coincidencia aproximada (para errores de tipeo comunes)
    // Por ejemplo: "mejorsinglutten" vs "mejorsingluten"
    for (const key of keys) {
        const keyNormalizada = normalizarNombre(key);
        // Si son similares (distancia de Levenshtein pequeña)
        // Implementación simple: si comparten más del 70% de caracteres
        const similarity = calcularSimilitud(nombreNormalizado, keyNormalizada);
        if (similarity > 0.7) {
            return mapa[key];
        }
    }
    
    return null;
}

// =============================================================================
// FUNCIÓN PARA CALCULAR SIMILITUD ENTRE DOS STRINGS (versión simple)
// =============================================================================
function calcularSimilitud(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    // Contar caracteres comunes
    const set1 = new Set(str1);
    const set2 = new Set(str2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
}

// =============================================================================
// FUNCIÓN PRINCIPAL: ELIMINAR TABLA, CREARLA E INSERTAR DATOS
// =============================================================================
async function reloadProducts() {
    let connection=null;
    let resultado = {};
    
    try {
        // 1. ESTABLECER CONEXIÓN A LA BASE DE DATOS
        console.log('🔄 Conectando a la base de datos...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión exitosa');

        // 2. OBTENER MAPEOS DESDE LA BASE DE DATOS
        const { proveedorMap, categoriaMap } = await obtenerMapeos(connection);

        // 3. LEER ARCHIVO JSON
        console.log(`📂 Leyendo archivo JSON: ${JSON_FILE_PATH}`);
        const jsonData = await fs.readFile(JSON_FILE_PATH, 'utf-8');
        const data = JSON.parse(jsonData);

        // Validar que el JSON tenga la estructura esperada
        if (!data.datos || !Array.isArray(data.datos)) {
            throw new Error('El archivo JSON no tiene la estructura esperada. Falta la propiedad "datos" o no es un array.');
        }

        console.log(`📊 Se encontraron ${data.datos.length} registros para procesar.`);

        // PASO agregado: Eliminar claves foráneas primero
        // ============================================================
        console.log('🔍 Verificando claves foráneas...');
        
        // Obtener las claves foráneas de la tabla productos
        const [foreignKeys] = await connection.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'productos' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
        `, [dbConfig.database]);
        
        // Eliminar cada clave foránea
        for (const fk of foreignKeys) {
            const constraintName = fk.CONSTRAINT_NAME;
            console.log(`🗑️ Eliminando clave foránea: ${constraintName}`);
            try {
                await connection.query(`ALTER TABLE productos DROP FOREIGN KEY ${constraintName}`);
            } catch (err) {
                console.log(`⚠️ No se pudo eliminar ${constraintName}:`, err.message);
            }
        }

                // DESHABILITAR CLAVES FORÁNEAS
        // ============================================================
        console.log('🔓 Deshabilitando verificación de claves foráneas...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 4. ELIMINAR LA TABLA productos SI EXISTE
        console.log('🗑️ Eliminando tabla productos (si existe)...');
        //await connection.execute('DROP TABLE IF EXISTS productos');
        await connection.query('DROP TABLE IF EXISTS productos CASCADE');
        console.log('✅ Tabla productos eliminada (o no existía)');

        // 5. CREAR LA TABLA productos DE NUEVO
        console.log('🏗️ Creando tabla productos...');
        await connection.execute(`
            CREATE TABLE productos (
                id INT PRIMARY KEY AUTO_INCREMENT,
                producto VARCHAR(255) NOT NULL,
                categoria_id INT NOT NULL,
                proveedor_id INT NOT NULL,
                precio_base DECIMAL(10, 2) DEFAULT 0.00,
                cantidad DECIMAL(10, 2) DEFAULT 0.00,
                origen VARCHAR(100) DEFAULT NULL,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (categoria_id) REFERENCES categorias(id),
                FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('✅ Tabla productos creada correctamente');

                // HABILITAR CLAVES FORÁNEAS (se recrearán automáticamente)
        // ============================================================
        console.log('🔒 Habilitando verificación de claves foráneas...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 6. PROCESAR Y PREPARAR LOS DATOS PARA INSERCIÓN
        console.log('🔄 Procesando datos del JSON...');
        const productos = data.datos;
        const valores = [];
        const errores = [];
        let erroresCategoria = 0;
        let erroresProveedor = 0;

        for (let i = 0; i < productos.length; i++) {
            const item = productos[i];
            
            // Buscar IDs de categoría y proveedor usando las funciones mejoradas
            const categoriaId = buscarIdEnMapa(item.categoria, categoriaMap, 'Categoría');
            const proveedorId = buscarIdEnMapa(item.proveedor, proveedorMap, 'Proveedor');

            // Si no se encuentra la categoría o el proveedor, se registra el error
            if (categoriaId === null) {
                console.warn(`⚠️ Producto "${item.producto}" (código: ${item.codigo}): Categoría "${item.categoria}" no encontrada en la base de datos.`);
                erroresCategoria++;
                errores.push({
                    producto: item.producto,
                    codigo: item.codigo,
                    campo: 'categoria',
                    valor: item.categoria
                });
                continue;
            }

            if (proveedorId === null) {
                console.warn(`⚠️ Producto "${item.producto}" (código: ${item.codigo}): Proveedor "${item.proveedor}" no encontrado en la base de datos.`);
                erroresProveedor++;
                errores.push({
                    producto: item.producto,
                    codigo: item.codigo,
                    campo: 'proveedor',
                    valor: item.proveedor
                });
                continue;
            }

            // Convertir precio y cantidad a float con safe parse
            const precioBase = parseFloatSafe(item.precio);
            const cantidad = parseFloatSafe(item.unidad);

            // Preparar el array de valores para la inserción
            valores.push([
                item.producto || '',
                categoriaId,
                proveedorId,
                precioBase,
                cantidad,
                item.origen || null
            ]);
        }

        console.log(`📦 ${valores.length} registros válidos listos para insertar.`);
        console.log(`⚠️ ${errores.length} registros omitidos por errores de mapeo:`);
        if (errores.length > 0) {
            console.log(`   - Categorías no encontradas: ${erroresCategoria}`);
            console.log(`   - Proveedores no encontrados: ${erroresProveedor}`);
            // Mostrar primeros 5 errores como ejemplo
            const mostrarErrores = errores.slice(0, 5);
            mostrarErrores.forEach(err => {
                console.log(`     * ${err.campo}: "${err.valor}" (producto: ${err.producto})`);
            });
            if (errores.length > 5) {
                console.log(`     ... y ${errores.length - 5} errores más`);
            }
        }

        // 7. INSERTAR DATOS EN LA TABLA
        if (valores.length > 0) {
            console.log('💾 Insertando datos en la tabla productos...');
            const query = `
                INSERT INTO productos (producto, categoria_id, proveedor_id, precio_base, cantidad, origen)
                VALUES ?
            `;
            const [result] = await connection.query(query, [valores]);
            console.log(`✅ ${result.affectedRows} registros insertados correctamente.`);
        } else {
            console.log('⚠️ No hay registros válidos para insertar. La tabla queda vacía.');
        }

        // 8. MOSTRAR RESUMEN FINAL
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN FINAL');
        console.log('='.repeat(60));
        console.log(`🔢 Total de registros en JSON: ${productos.length}`);
        console.log(`✅ Registros procesados y guardados: ${valores.length}`);
        console.log(`❌ Registros omitidos por errores: ${errores.length}`);
        console.log(`   - Categorías no encontradas: ${erroresCategoria}`);
        console.log(`   - Proveedores no encontrados: ${erroresProveedor}`);
        
        // Consultar cuántos registros quedaron en la tabla
        const [countResult] = await connection.query('SELECT COUNT(*) as total FROM productos');
        console.log(`📈 Registros totales en tabla productos: ${countResult[0].total}`);
        console.log('='.repeat(60));
        console.log('✨ ¡Proceso completado con éxito!');
         // ============================================================
    // RESULTADO POR DEFECTO (SIEMPRE RETORNA ESTO)
    // ============================================================
    resultado = {
        mensaje: 'Proceso Terminado',
        detalles: {
            totalJSON: productos.length,           
            insertados: valores.length,       
            errores: errores.length,      
            erroresDetalle: errores.slice(0, 10)
        }
    };

    } catch (error) {
        console.error('❌ Error durante la ejecución del script:');
        console.error(error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión a la base de datos cerrada.');
        }
    }
    return resultado;
}

// =============================================================================
// EJECUCIÓN DEL SCRIPT
// =============================================================================
// Si se ejecuta directamente (no como módulo)
if (require.main === module) {
    reloadProducts()
        .then(() => {
            console.log('✅ Script finalizado correctamente.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script finalizado con errores.');
            process.exit(1);
        });
}

// Exportar la función para poder usarla desde otros módulos
module.exports = { reloadProducts };