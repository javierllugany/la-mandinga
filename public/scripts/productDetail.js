// Este archivo complementa main.js con funcionalidades adicionales para el detalle de productos

// Función para actualizar el stock en tiempo real (ejemplo de actualización)
async function updateStock(productId, newQuantity) {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/${productId}/stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock_quantity: newQuantity })
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar el stock');
        }
        
        const result = await response.json();
        if (result.success) {
            // Refrescar la vista después de actualizar
            await renderCategories();
        }
    } catch (error) {
        console.error('Error updating stock:', error);
    }
}

// Función para buscar productos
async function searchProducts(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error searching productos:', error);
        return null;
    }
}

// Exportar funciones para uso global
window.updateStock = updateStock;
window.searchProducts = searchProducts;

    document.querySelector('.btn-add-large')?.addEventListener('click', () => {
        alert(`Producto ${product.nombre} agregado al carrito`);
    });

// Inicializar
//document.addEventListener('DOMContentLoaded', loadProductDetail);
