// ============================================================
// CONFIGURACIÓN
// ============================================================
const API_URL = '/api';

// ============================================================
// DOM ELEMENTS
// ============================================================
const btnRecargar = document.getElementById('btnRecargar');
const btnCancelar = document.getElementById('btnCancelar');
const btnConfirmar = document.getElementById('btnConfirmar');
const modal = document.getElementById('modalConfirmacion');
const resultadoDiv = document.getElementById('resultado');
const mensajeDiv = document.getElementById('resultadoMensaje');
const detallesDiv = document.getElementById('resultadoDetalles');

// ============================================================
// FUNCIONES
// ============================================================
function mostrarConfirmacion() {
    modal.classList.add('active');
    const total = document.getElementById('totalProductos').textContent;
    document.getElementById('productosAEliminar').textContent = total;
}

function cerrarModal() {
    modal.classList.remove('active');
}

async function ejecutarRecarga() {
    cerrarModal();
    
    btnRecargar.disabled = true;
    btnRecargar.classList.add('cargando');
    btnRecargar.querySelector('.texto').textContent = '⏳ Recargando productos...';
    
    resultadoDiv.className = 'resultado';
    resultadoDiv.style.display = 'none';
    
    try {
        const response = await fetch(`${API_URL}/admin/reload-products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        resultadoDiv.style.display = 'block';
        
        if (data.success) {
            resultadoDiv.className = 'resultado exito';
            mensajeDiv.innerHTML = `✅ ${data.message}`;
            
            if (data.details) {
                detallesDiv.innerHTML = `
                    <div class="detalles-grid">
                        <div class="detalle-item">
                            <div class="valor">${data.details.totalJSON}</div>
                            <div>Total en JSON</div>
                        </div>
                        <div class="detalle-item">
                            <div class="valor" style="color: #28a745;">${data.details.insertados}</div>
                            <div>Insertados</div>
                        </div>
                        <div class="detalle-item">
                            <div class="valor" style="color: #dc3545;">${data.details.errores}</div>
                            <div>Errores</div>
                        </div>
                    </div>
                `;
                
                if (data.details.erroresCategoria > 0 || data.details.erroresProveedor > 0) {
                    detallesDiv.innerHTML += `
                        <div style="margin-top: 10px; font-size: 13px; color: #856404; background: #fff3cd; padding: 10px; border-radius: 4px;">
                            <strong>Detalles de errores:</strong><br>
                            Categorías no encontradas: ${data.details.erroresCategoria} | 
                            Proveedores no encontrados: ${data.details.erroresProveedor}
                        </div>
                    `;
                }
            }
        } else {
            resultadoDiv.className = 'resultado error';
            mensajeDiv.innerHTML = `❌ ${data.message || 'Error desconocido'}`;
        }
    } catch (error) {
        resultadoDiv.className = 'resultado error';
        resultadoDiv.style.display = 'block';
        mensajeDiv.innerHTML = `❌ Error de conexión: ${error.message}`;
        console.error('Error:', error);
    } finally {
        btnRecargar.disabled = false;
        btnRecargar.classList.remove('cargando');
        btnRecargar.querySelector('.texto').textContent = '🔄 Recargar Productos desde JSON';
        cargarEstadisticas();
    }
}

async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}/admin/productos/stats`);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalProductos').textContent = data.stats.totalProductos;
            document.getElementById('totalCategorias').textContent = data.stats.totalCategorias;
            document.getElementById('totalProveedores').textContent = data.stats.totalProveedores;
            document.getElementById('ultimaActualizacion').textContent = new Date().toLocaleString('es-AR');
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ============================================================
// INICIALIZACIÓN - Cuando el DOM está listo
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar fecha actual
    document.getElementById('fechaActual').textContent = new Date().toLocaleString('es-AR');
    
    // Cargar estadísticas
    cargarEstadisticas();
    
    // Actualizar cada 30 segundos
    setInterval(cargarEstadisticas, 30000);
    
    // Asignar event listeners
    btnRecargar.addEventListener('click', mostrarConfirmacion);
    btnCancelar.addEventListener('click', cerrarModal);
    btnConfirmar.addEventListener('click', ejecutarRecarga);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === e.currentTarget) {
            cerrarModal();
        }
    });
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
        }
    });
});

// Exportar funciones para usar en otros archivos si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        mostrarConfirmacion, 
        cerrarModal, 
        ejecutarRecarga, 
        cargarEstadisticas 
    };
}