// Gestión del carrito de compras
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateBadge();
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
        this.showNotification('Producto agregado al carrito');
    }

    // Eliminar producto del carrito
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateBadge();
        this.updateCartModal();
        this.showNotification('Producto eliminado del carrito');
    }

    // Actualizar cantidad
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
                return;
            }
            item.quantity = quantity;
            this.saveCart();
            this.updateBadge();
            this.updateCartModal();
        }
    }

    // Calcular total
    getTotal() {
        return this.items.reduce((total, item) => {
            const price = item.price_per_100g || item.price_per_kg || 0;
            return total + (price * item.quantity);
        }, 0);
    }

    // Guardar en localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Actualizar badge del carrito
    updateBadge() {
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('#cartBadge, #mobileCartBadge');
        badges.forEach(badge => {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        });
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
                    <p style="color: #999; font-size: 0.9rem;">¡Explora nuestros productos saludables!</p>
                </div>
            `;
            cartTotal.textContent = '$0.00';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${(item.price_per_100g || item.price_per_kg || 0).toFixed(2)}</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button onclick="cart.removeItem(${item.id})" class="remove-item">
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
            this.showNotification('¡Compra finalizada! Gracias por tu pedido');
            this.items = [];
            this.saveCart();
            this.updateBadge();
            this.updateCartModal();
            document.getElementById('cart-modal').style.display = 'none';
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
        const name = productElement.querySelector('h3').textContent;
        const priceText = productElement.querySelector('.product-price').textContent;
        const price = parseFloat(priceText.match(/\d+\.?\d*/)[0]) || 0;
        
        cart.addItem({
            id: productId,
            name: name,
            price_per_100g: price,
            price_per_kg: price * 9
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
            price_per_100g: ${product.price_per_100g || 0},
            price_per_kg: ${product.price_per_kg || 0}
        })" class="add-to-cart-btn">
            <i class="fas fa-shopping-cart"></i> Agregar al Carrito
        </button>
    `;
};