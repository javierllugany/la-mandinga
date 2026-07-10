// Configuración
//const API_BASE_URL = 'http://localhost:3000/api'; //DESARROLLO
const API_BASE_URL = 'https://iguanapop.net.ar/api'; //PRODUCCION

// Elementos DOM
const categoriasContainer = document.getElementById('categorias-container');

let listaCategorias = [];
let listaCatalogo = [];

// Función para obtener datos de la API
async function fetchData(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Renderizar categorías y productos
async function renderCategories() {
    try {
        const objetoCategorias = await fetchData('/categorias');
        if (!objetoCategorias || !objetoCategorias.success) {
            categoriasContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar las categorías. Por favor, intenta más tarde.</p>
                </div>
            `;
            return;
        }

        const objetoCatalogo = await fetchData('/catalogo');
        if (!objetoCatalogo || !objetoCatalogo.success) {
            categoriasContainer.innerHTML = `
                <div class="error-message">
                    <p>Error al cargar los productos del catálogo. Por favor, intenta más tarde.</p>
                </div>
            `;
            return;
        }

        listaCategorias = objetoCategorias.data;
        console.log('Categorías obtenidas:', listaCategorias);
        if (listaCategorias.length === 0) {
            categoriasContainer.innerHTML = `
                <div class="empty-message">
                    <p>No hay categorías disponibles en este momento.</p>
                </div>
            `;
            return;
        }

        listaCatalogo = objetoCatalogo.data;
        console.log('Productos del catálogo obtenidos:', listaCatalogo);
        if (listaCatalogo.length === 0) {
            categoriasContainer.innerHTML = `
                <div class="empty-message">
                    <p>No hay productos disponibles en este momento.</p>
                </div>
            `;
            return;
        }
            
        const resultado = asignarProductosACategoria(listaCatalogo, listaCategorias);
        console.log('Resultado de verificación de categorías con productos:', resultado);

        const clavesCategoria = Object.keys(resultado).map(Number);

        for(i=0; i<clavesCategoria.length; i++){
            const categoria = listaCategorias.find(c => c.id === clavesCategoria[i]);
            categoriasContainer.innerHTML += `
                <div class="category-card" data-category-id="${categoria.id}">
                    <div class="category-header" onclick="loadCategoryProducts(${categoria.id})">

                    	<!-- en DESARROLLO -->
                        <!-- <img src="../images/${categoria.image_url || '/images/default-category.jpg'}"
                        alt="${categoria.nombre}" 
                        class="category-image"
                        onerror="this.src='/images/default-category.jpg'"> -->

                        <!-- en PRODUCCION -->
                        <img src="/lamandinga/public/images/${categoria.image_url || '/lamandinga/public/images/default-category.jpg'}"
                            alt="${categoria.nombre}" 
                            class="category-image"
                            onerror="this.src='/lamandinga/public/images/default-category.jpg'; this.onerror=null;">
                            
                        <div class="category-info">
                            <h2>${categoria.nombre}</h2>
                            <p>${categoria.descripcion || 'Productos naturales de alta calidad'}</p>
                        </div>
                        <div class="category-icon">▶</div>
                    </div>
                    <div class="productos-list" id="productos-${categoria.id}">
                    </div>
                </div>
            `;
            const claveParaBuscar = clavesCategoria[i].toString();
            const productosContainer = document.getElementById('productos-' + categoria.id);
            let contadorStock = 0;
            for(j=0; j<resultado[claveParaBuscar].length; j++){
                const producto = resultado[claveParaBuscar][j];
                const hasStock = producto.stock > 0;
                    if (hasStock) {
                        continue;
                    } else {
                        contadorStock++;
                    }    
                    if (contadorStock < 5) {
                        continue;
                    } else {
                        break;
                    }
            }
            if (contadorStock === 5) {
                for(j=0; j<resultado[claveParaBuscar].length; j++){
                    const producto = resultado[claveParaBuscar][j];
                    const hasStock = producto.stock > 0;
                    if (!hasStock) {
                        continue;
                    }else{
                        productosContainer.innerHTML+=`
                            <div class="product-item" data-product-id="${producto.id}">
                                <h3>${producto.producto}</h3>
                                <div class="product-origin">${producto.origen || 'Origen no especificado'}</div>
                                <div class="product-resaltado">${producto.resaltado || ''}</div>
                                <div class="product-price">
                                ${producto.precioVenta ? ` | $${producto.precioVenta} ${producto.unidad ? `${producto.unidad}` : ''}` : ''} 
                                </div>
                                ${producto.resaltado === 'encargar con anticipación' ? 'continue;' : 
                                    '<div class="stock-badge in-stock">✅ En stock</div>'
                                }
                            </div>
                            `;
                    }
                }
            }else{
                for(j=0; j<resultado[claveParaBuscar].length; j++){
                    const producto = resultado[claveParaBuscar][j];
                    const hasStock = producto.stock > 0;
                    productosContainer.innerHTML+=`
                        <div class="product-item" data-product-id="${producto.id}">
                            <h3>${producto.producto}</h3>
                            <div class="product-origin">${producto.origen || 'Origen no especificado'}</div>
                            <div class="product-resaltado">${producto.resaltado || ''}</div>
                            <div class="product-price">
                                ${producto.precioVenta ? ` | $${producto.precioVenta} ${producto.unidad ? `${producto.unidad}` : ''}` : ''} 
                            </div>
                            ${producto.resaltado === 'encargar con anticipación' ? '' : 
                                `<div class="stock-badge ${hasStock ? 'in-stock' : 'out-of-stock'}">
                                    ${hasStock ? '✅ En stock' : '❌ Sin stock'}
                                </div>`}
                        </div>
                    `;
                }
            }
        };

        // Agregar event listeners para los productos
        document.querySelectorAll('.product-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = this.dataset.productId;
                if (productId) {
                    loadProductDetail(productId);
                }
            });
        });

    } catch (error) {
        console.error('Error rendering categorias:', error);
        categoriasContainer.innerHTML = `
            <div class="error-message">
                <p>Error al cargar los productos. Por favor, verifica tu conexión.</p>
            </div>
        `;
    }
}

function asignarProductosACategoria(listaCatalogo, listaCategorias) {
    // Crear un Map con los IDs de categorías
    const resultadoMap = new Map();

    listaCategorias.forEach(categoria => {
        resultadoMap.set(categoria.id, []);
    });

    // Llenar el Map con los productos
    listaCatalogo.forEach(producto => {
        if (resultadoMap.has(producto.categoria_id)) {
            resultadoMap.get(producto.categoria_id).push(producto);
        }
    });

    // Filtramos las entradas donde la longitud del array sea mayor a 0
    const resultadoMapResumido = new Map([...resultadoMap].filter(([categoria, productos]) => productos.length > 0));

    // Convertir a objeto (opcional)
    const resultado = Object.fromEntries(resultadoMapResumido);

    return resultado;
}

// Cargar detalle del producto (función global para el modal)
window.loadProductDetail = async function(productId) {
    try {
        const result = await fetchData(`/productos/${productId}`);
        if (!result || !result.success) {
            alert('Error al cargar los detalles del producto');
            return;
        }

        const product = result.data;
        const modal = document.getElementById('product-modal');
        const productDetail = document.getElementById('product-detail');
        
        const hasStock = product.stock_quantity > 0;
        productDetail.innerHTML = `
            <h2>${product.nombre}</h2>
            <div class="detail-row">
                <span class="detail-label">Categoría</span>
                <span class="detail-value">${product.categoria_nombre || 'Sin categoría'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Descripción</span>
                <span class="detail-value">${product.descripcion || 'Sin descripción disponible'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Origen</span>
                <span class="detail-value">${product.origin || 'No especificado'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Precio por 100g</span>
                <span class="detail-value price-highlight">$${product.price_per_100g ? product.price_per_100g.toFixed(2) : '0.00'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Precio por 1kg</span>
                <span class="detail-value price-highlight">$${product.price_per_kg ? product.price_per_kg.toFixed(2) : '0.00'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Stock</span>
                <span class="detail-value ${hasStock ? 'in-stock' : 'out-of-stock'}">
                    ${hasStock ? `✅ ${product.stock_quantity} unidades disponibles` : '❌ Sin stock'}
                </span>
            </div>
        `;

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error loading product detail:', error);
        alert('Error al cargar los detalles del producto');
    }
};

// Cerrar modal
document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('product-modal').style.display = 'none';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// NUEVO AGREGADO: 9jul2026

// Toggle del menú mobile
document.getElementById('menuToggle').addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
    
    // Cambiar icono
    const icon = this.querySelector('i');
    if (mobileMenu.classList.contains('active')) {
        icon.className = 'fas fa-times';
    } else {
        icon.className = 'fas fa-bars';
    }
});

// Cerrar menú mobile al hacer clic fuera
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const menuToggle = document.getElementById('menuToggle');
    
    if (mobileMenu.classList.contains('active') && 
        !mobileMenu.contains(event.target) && 
        !menuToggle.contains(event.target)) {
        mobileMenu.classList.remove('active');
        menuToggle.querySelector('i').className = 'fas fa-bars';
    }
});

// Inicializar la app
document.addEventListener('DOMContentLoaded', renderCategories);
