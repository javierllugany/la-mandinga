// Gestión del carrito de compras
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateBadge();
        // Ejecutar updateBadgeProducto después de 2 segundos
        setTimeout(() => {
            this.updateBadgeProducto();
        }, 1000);
        this.setupEventListeners();
    }

    // Agregar producto al carrito
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateBadge();
        this.updateBadgeProducto(product.id);
        this.showNotification('Producto agregado al carrito');
    }


    // Actualizar cantidad
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
            if (item) {
                if (quantity <= 0) {
                    cart.removeItem(productId);
                    return;
                }
                item.quantity = quantity;
                this.saveCart();
                this.updateBadge();
                this.updateBadgeProducto(productId);
                this.updateCartModal();
            }
    }

    // Eliminar producto del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateBadge();
        this.updateBadgeProducto(productId);
        this.updateCartModal();
        this.showNotification('Producto eliminado del carrito');
    }

    // Calcular total
    getTotal() {
        return this.items.reduce((total, item) => {
            const price = item.precio || 0;
            return total + (price * item.quantity);
        }, 0);
    }

    // Guardar en localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Actualizar el carrito del menu
    updateBadge() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('#cartBadge, #mobileCartBadge');
        badges.forEach(badge => {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        });
    }

    // actualizar el carrito del producto y del producto de busqueda
    updateBadgeProducto(id, compra) {
        if (id) {
            const itemProducto = this.items.find(item => item.id === id);
            const badgeProducto = document.getElementById(`badge-${id}`);
            const badgeProductoSearch = document.getElementById(`badge-search-${id}`);
            if(itemProducto){
                badgeProducto.textContent = itemProducto.quantity;
            }else{
                badgeProducto.textContent = 0;
            }
            badgeProducto.style.display = badgeProducto.textContent > 0 ? 'block' : 'none';
            if(badgeProductoSearch){
                if(itemProducto){
                    badgeProductoSearch.textContent = itemProducto.quantity;
                }else{
                    badgeProductoSearch.textContent = 0;
                }
                badgeProductoSearch.style.display = badgeProducto.textContent > 0 ? 'block' : 'none';
            }
        }else{
            let itemTemp = this.items;
            itemTemp.forEach((item) => {
                const badgeProductoDeCatalogo = document.getElementById(`badge-${item.id}`);
                const badgeProductoDeSearch = document.getElementById(`badge-search-${item.id}`);
                if(compra){
                    badgeProductoDeCatalogo.textContent = 0;
                }else{
                    badgeProductoDeCatalogo.textContent = item.quantity;
                }
                if(badgeProductoDeSearch){
                    if(compra){
                        badgeProductoDeSearch.textContent = 0;
                    }else{
                        badgeProductoDeSearch.textContent = item.quantity;
                    }
                    badgeProductoDeSearch.style.display = badgeProductoDeSearch.textContent > 0 ? 'block' : 'none';
                }
                badgeProductoDeCatalogo.style.display = badgeProductoDeCatalogo.textContent > 0 ? 'block' : 'none';
            });
        }
    }

    // Mostrar modal del carrito
    showCart() {
        const modal = document.getElementById('cart-modal');
        modal.style.display = 'block';
        this.updateCartModal();
    }

    // Actualizar contenido del modal del carrito
    updateCartModal() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cartTotal');

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>🛒 Tu carrito está vacío</p>
                    <p style="color: #2c3e50; font-size: 0.9rem;">¡Explora nuestros productos saludables!</p>
                </div>
            `;
            cartTotal.textContent = '$0.00';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.precioYunidad}</div>
                </div>
                <div class="cart-item-actions">
                    <button class="botonMenosCarrito" data-id="${item.id}" data-quantity="${item.quantity - 1}">-</button>
                    <span>${item.quantity}</span>
                    <button class="botonMasCarrito" data-id="${item.id}" data-quantity="${item.quantity + 1}">+</button>
                    <button data-id="${item.id}" class="remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        cartTotal.textContent = `$${this.getTotal().toFixed(2)}`;
    }

    // Mostrar notificación
    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : ''}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    //ESCRIBIR LOGICA DE LA COMPRA... Envia whatsapp con lista
    gestionarPedido(items){
        console.log('Pedido Confirmado');
        return true;
    }

    // Configurar event listeners
    setupEventListeners() {
        // Abrir carrito
        document.getElementById('cartBtn').addEventListener('click', () => this.showCart());
        document.getElementById('mobileCartBtn').addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.remove('active');
            this.showCart();
        });

        // Cerrar carrito
        document.getElementById('closeCart').addEventListener('click', () => {
            document.getElementById('cart-modal').style.display = 'none';
        });

        // Finalizar compra
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (this.items.length === 0) {
                this.showNotification('El carrito está vacío', true);
                return;
            }
            let confirmacionCompra = false;
            confirmacionCompra = this.gestionarPedido(this.items);
            if(confirmacionCompra){
                this.updateBadgeProducto(false, true);
                this.showNotification('¡Tu pedido ha sido gestionado! Pronto recibirás más info por Whatsapp. Muchas Gracias!');
                this.items = [];
                this.saveCart();
                this.updateBadge();
                this.updateCartModal();
                document.getElementById('cart-modal').style.display = 'none';
            }else{
                this.showNotification('¡Tu pedido no ha sido gestionado. Aún puedes agregar o quitar productos del carrito, cancelar el pedido o confirmarlo. Muchas Gracias!');
            }
        });

        // Configuración de event delegation para botones dinámicos
        document.addEventListener('DOMContentLoaded', function() {
            // Suponiendo que tus botones tienen una clase específica
            document.addEventListener('click', function(e) {
                // Buscar si el click fue en un botón con clase 'btn-arte'
                const button = e.target.closest('.botonMenosCarrito');
                const button2 = e.target.closest('.botonMasCarrito');
                let boton;
                if (button) {
                    boton=button;
                }else if(button2){
                    boton=button2
                }
                if (boton) {
                    // Obtener parámetros desde data-attributes
                    const param1 = Number(boton.dataset.id);
                    const param2 = Number(boton.dataset.quantity);
                    cart.updateQuantity(param1, param2);
                }
                const buttonDel = e.target.closest('.remove-item');
                if (buttonDel) {
                    const param1 = Number(buttonDel.dataset.id);
                    
                    // Llamar a la función arte con los parámetros
                    if (param1) {
                        cart.removeItem(param1);
                    }
                }
            });
        });
    }
}

// Inicializar carrito
const cart = new ShoppingCart();

// Función global para agregar al carrito desde los productos
window.addToCart = function(productId) {
    // Obtener producto de la base de datos o del DOM
    const productElement = document.querySelector(`.product-item[data-product-id="${productId}"]`);
    if (productElement) {
        const producto = productElement.querySelector('h3').textContent;
        const precioYunidadConInicio = productElement.querySelector('.product-price').textContent;
        const precioYunidad = precioYunidadConInicio.replace(/\|\s\$/g, "");
        const precio = parseFloat(precioYunidad.match(/\d+\.?\d*/)[0]) || 0;
        
        cart.addItem({
            id: productId,
            name: producto,
            precioYunidad: precioYunidad,
            precio: precio
        });
    }
};

// Agregar botón "Agregar al carrito" a los productos en el detalle
window.loadProductDetail = async function(productId) {
    // ... código existente ...
    
    // Modificar el HTML del detalle para incluir botón de agregar al carrito
    productDetail.innerHTML = `
        <!-- ... información existente ... -->
        <button onclick="cart.addItem({
            id: ${product.id},
            name: '${product.name}',
            precioYunidad: ${product.precioYunidad || 0},
            precio: ${product.precio || 0}
        })" class="add-to-cart-btn">
            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
        </button>
    `;
};