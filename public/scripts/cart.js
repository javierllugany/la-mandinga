// Gestión del carrito de compras
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateBadge();
        // Ejecutar updateBadgeProducto después de 2 segundos
        setTimeout(() => {
            this.updateBadgeProducto();
        }, 3000);
        this.setupEventListeners();
        this.setupCheckoutListeners(); // Nuevo método
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

    // Obtener resumen del pedido para mostrar
    getOrderSummary() {
        return this.items.map(item => ({
            nombre: item.name,
            cantidad: item.quantity,
            precioUnitario: item.precio,
            subtotal: item.precio * item.quantity,
            precioYunidad: item.precioYunidad || `$${item.precio}`
        }));
    }

    // 🆕 Configurar listeners específicos del checkout
    setupCheckoutListeners() {
        // Listener para método de comunicación
        document.querySelectorAll('input[name="metodoComunicacion"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.toggleCommunicationFields(e.target.value);
            });
        });

        // Listener para método de entrega
        document.querySelectorAll('input[name="metodoEntrega"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.toggleDeliveryFields(e.target.value);
                });
            });
    }

    // 🆕 Mostrar/ocultar campos según método de comunicación
    toggleCommunicationFields(metodo) {
        const whatsappFields = document.getElementById('whatsapp-fields');
        const emailFields = document.getElementById('email-fields');
        
        if (metodo === 'whatsapp') {
            whatsappFields.style.display = 'block';
            emailFields.style.display = 'none';
            document.getElementById('customerPhone').required = true;
            document.getElementById('customerEmail').required = false;
            document.getElementById('customerEmail').value = '';
        } else {
            whatsappFields.style.display = 'none';
            emailFields.style.display = 'block';
            document.getElementById('customerPhone').required = false;
            document.getElementById('customerEmail').required = true;
            document.getElementById('customerPhone').value = '';
        }
    }

    // 🆕 Mostrar/ocultar campos según método de entrega
    toggleDeliveryFields(metodo) {
        const domicilioFields = document.getElementById('domicilio-fields');
        const retiroFields = document.getElementById('retiro-fields');
        
        if (metodo === 'domicilio') {
            domicilioFields.style.display = 'block';
            retiroFields.style.display = 'none';
            document.getElementById('customerName').required = true;
            document.getElementById('customerAddress').required = true;
            document.getElementById('customerNameRetiro').required = false;
            document.getElementById('customerNameRetiro').value = '';
        } else {
            domicilioFields.style.display = 'none';
            retiroFields.style.display = 'block';
            document.getElementById('customerName').required = false;
            document.getElementById('customerAddress').required = false;
            document.getElementById('customerNameRetiro').required = true;
            document.getElementById('customerName').value = '';
            document.getElementById('customerAddress').value = '';
        }
    }

    // 🆕 Validar formulario según opciones seleccionadas
    validateCheckoutForm(formData) {
        // Validar nombre (siempre requerido)
        if (!formData.nombre || formData.nombre.trim() === '') {
            this.showNotification('Por favor, completa tu nombre', true);
            return false;
        }

        // Validar según método de comunicación
        if (formData.metodoComunicacion === 'whatsapp') {
            if (!formData.telefono || formData.telefono.trim() === '') {
                this.showNotification('Por favor, ingresa tu número de WhatsApp', true);
                return false;
            }
            // Validar formato de teléfono (mínimo 10 dígitos)
            const telefonoLimpio = formData.telefono.replace(/\D/g, '');
            if (telefonoLimpio.length < 10) {
                this.showNotification('Por favor, ingresa un número de teléfono válido (mínimo 10 dígitos)', true);
                return false;
            }
        } else {
            if (!formData.email || formData.email.trim() === '') {
                this.showNotification('Por favor, ingresa tu email', true);
                return false;
            }
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                this.showNotification('Por favor, ingresa un email válido', true);
                return false;
            }
        }

        // Validar dirección según método de entrega
        if (formData.metodoEntrega === 'domicilio') {
            if (!formData.direccion || formData.direccion.trim() === '') {
                this.showNotification('Por favor, completa la dirección de entrega', true);
                return false;
            }
        }

        return true;
    }

    // 🆕 Procesar pedido (Checkout) - Versión Actualizada
    async processOrder(formData) {
        try {
            // Validar formulario
            if (!this.validateCheckoutForm(formData)) {
                return false;
            }

            // Crear objeto del pedido
            const pedido = {
                id: Date.now(),
                fecha: new Date().toLocaleString(),
                cliente: {
                    nombre: formData.nombre,
                    email: formData.metodoComunicacion === 'email' ? formData.email : formData.email || 'No especificado',
                    telefono: formData.metodoComunicacion === 'whatsapp' ? formData.telefono : formData.telefono || 'No especificado',
                    metodoComunicacion: formData.metodoComunicacion,
                    metodoEntrega: formData.metodoEntrega,
                    direccion: formData.metodoEntrega === 'domicilio' ? formData.direccion : 'Retiro en local'
                },
                items: this.getOrderSummary(),
                total: this.getTotal(),
            };

            // Mostrar loading en el botón
            const btn = document.getElementById('confirmOrderBtn');
            btn.classList.add('btn-loading');
            btn.disabled = true;

            // Intentar enviar según método de comunicación
            let envioExitoso = false;
            
            if (formData.metodoComunicacion === 'whatsapp') {
                envioExitoso = await this.sendWhatsApp(pedido);
            } else {
                envioExitoso = await cart.sendEmail(pedido);
            }

            // Remover loading
            btn.classList.remove('btn-loading');
            btn.disabled = false;

            console.log('envioExitoso: ', envioExitoso);

            // Si el envío fue exitoso, mostrar confirmación
            if (envioExitoso) {
                // Guardar pedido
                this.saveOrderHistory(pedido);
                
                // Mostrar confirmación
                this.showConfirmation(pedido);
                
                // Limpiar carrito
                this.updateBadgeProducto(false, true);
                this.items = [];
                this.saveCart();
                this.updateBadge();
                
                // Cerrar modal de checkout
                document.getElementById('checkout-modal').style.display = 'none';
                
                this.showNotification('¡Pedido confirmado y enviado!');
                return true;
            } else {
                this.showNotification('Error al enviar el pedido. Por favor, intenta nuevamente.', true);
                return false;
            }

        } catch (error) {
            console.error('Error al procesar pedido:', error);
            this.showNotification('Error al procesar el pedido', true);
            return false;
        }
    }

    // 🆕 Enviar por WhatsApp - Versión actualizada con retorno booleano
    async sendWhatsApp(pedido) {
        try {
            if (!pedido) {
                this.showNotification('No hay pedido para enviar', true);
                return false;
            }

            // Formatear mensaje para WhatsApp
            let mensaje = `🌿 *LA MANDINGA - Productos Saludables*\n\n`;
            mensaje += `*¡Gracias por tu pedido, ${pedido.cliente.nombre}!*\n`;
            mensaje += `Hemos recibido tu pedido correctamente.\n`;
            mensaje += `Aquí tienes los detalles:\n\n`;
            mensaje += `📋 *Número de Pedido:* #${String(pedido.id).padStart(8, '0')}\n`;
            mensaje += `📅 *Fecha:* ${pedido.fecha}\n\n`;
            mensaje += `👤 *Datos del Cliente:*\n`;
            mensaje += `Nombre: ${pedido.cliente.nombre}\n`;
            
            if (pedido.cliente.metodoComunicacion === 'whatsapp') {
                mensaje += `WhatsApp: ${pedido.cliente.telefono}\n`;
            } else {
                mensaje += `Email: ${pedido.cliente.email}\n`;
            }
            mensaje += `📦 *Método de entrega:* ${pedido.cliente.metodoEntrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en local'}\n`;
            
            if (pedido.cliente.metodoEntrega === 'domicilio') {
                mensaje += `📍 *Dirección:* ${pedido.cliente.direccion}\n\n`;
            } else {
                mensaje += `📍 *Retiro en:* Ruta Prov. 89 nº12890, Las Vegas - Potrerillos\n`;
                mensaje += `🕐 *Horario:* Sab y Dom de 10 a 18hs\n\n`;
            }
            
            mensaje += `🛒 *Productos:*\n`;
            
            pedido.items.forEach((item, index) => {
                mensaje += `${index + 1}. ${item.nombre} x ${item.cantidad} = $${item.subtotal.toFixed(2)}\n`;
            });
            
            mensaje += `\n💰 *Total: $${pedido.total.toFixed(2)}*\n\n`;
            mensaje += `💳 El pago se realiza al recibir los productos\n\n`;
            mensaje += `¡Gracias por confiar en La Mandinga! 🌿`;

            // Codificar mensaje para URL
            const mensajeCodificado = encodeURIComponent(mensaje);
            
            // Número de WhatsApp (reemplazar con el número real)
            // Formato: código país + número sin + ni espacios
            const numeroWhatsApp = '5492612523996';
            // Abrir WhatsApp
            this.showNotification('Abriendo WhatsApp...');
            await window.open(`https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`, '_blank');
            return true;
        } catch (error) {
            console.error('Error al enviar WhatsApp:', error);
            return false;
        }
    }

    async sendEmail(pedido) {
    try {
        if (!pedido) {
            this.showNotification('No hay pedido para enviar', true);
            return false;
        }

        // Generar HTML del email
        const htmlBody = this.generateEmailHTML(pedido);
        // Enviar al backend
        const response = await fetch(`${API_BASE_URL}/email/send-order-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: pedido.cliente.email,
                subject: `Pedido #${String(pedido.id).padStart(8, '0')} - La Mandinga`,
                html: htmlBody,
            })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error al enviar email');
        }

        this.showNotification('✅ Correo enviado exitosamente');

        return true;

    } catch (error) {
        console.error('Error al enviar email:', error);
        return false;
    }
}

    // Método para generar HTML del email
generateEmailHTML(pedido) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #2d5016 0%, #4a7c2e 100%);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f8f6f0;
            padding: 20px;
            border-radius: 0 0 8px 8px;
        }
        .section {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e8e4dc;
        }
        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .section-title {
            font-weight: bold;
            color: #2d5016;
            font-size: 1.1em;
            margin-bottom: 10px;
        }
        .product-item {
            padding: 5px 0;
            border-bottom: 1px solid #e8e4dc;
        }
        .product-item:last-child {
            border-bottom: none;
        }
        .total {
            font-size: 1.2em;
            font-weight: bold;
            color: #2d5016;
            text-align: right;
            padding-top: 10px;
            margin-top: 10px;
            border-top: 2px solid #4a7c2e;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e8e4dc;
            color: #666;
            font-size: 0.9em;
        }
        .badge {
            display: inline-block;
            background: #4a7c2e;
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.8em;
        }
        .info-row {
            padding: 5px 0;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            min-width: 120px;
        }
        .highlight {
            background: #e8f5e9;
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .payment-info {
            background: #fff3cd;
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">🌿 La Mandinga</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Productos Saludables</p>
    </div>
    
    <div class="content">
        <h2 style="color: #2d5016; margin-top: 0;">¡Gracias por tu pedido, ${pedido.cliente.nombre}!</h2>
        <p style="font-size: 1.1em;">Hemos recibido tu pedido correctamente. Aquí tienes los detalles:</p>
        
        <div class="section">
            <div class="section-title">📋 Información del Pedido</div>
            <div class="info-row">
                <span class="info-label">Número de Pedido:</span>
                <span class="badge">#${String(pedido.id).padStart(8, '0')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">📅 Fecha:</span>
                <span>${pedido.fecha}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">👤 Datos del Cliente</div>
            <div class="info-row">
                <span class="info-label">Nombre:</span>
                <span>${pedido.cliente.nombre}</span>
            </div>
            <div class="info-row">
                <span class="info-label">${pedido.cliente.metodoComunicacion === 'email' ? '✉️ Email:' : '📱 WhatsApp:'}</span>
                <span>${pedido.cliente.metodoComunicacion === 'email' ? pedido.cliente.email : pedido.cliente.telefono}</span>
            </div>
            <div class="info-row">
                <span class="info-label">📦 Entrega:</span>
                <span>${pedido.cliente.metodoEntrega === 'domicilio' ? 'Envío a domicilio' : 'Retiro en local'}</span>
            </div>
            ${pedido.cliente.metodoEntrega === 'domicilio' ? `
            <div class="info-row">
                <span class="info-label">📍 Dirección:</span>
                <span>${pedido.cliente.direccion}</span>
            </div>
            ` : `
            <div class="highlight">
                <div><strong>📍 Retiro en:</strong> Ruta Prov. 89 nº12890, Las Vegas - Potrerillos</div>
                <div><strong>🕐 Horario:</strong> Sábados y Domingos de 10 a 18hs</div>
            </div>
            `}
        </div>
        
        <div class="section">
            <div class="section-title">🛒 Productos</div>
            ${pedido.items.map((item) => `
                <div class="product-item">
                    <span>${item.nombre}</span>
                    <span style="float: right;">x ${item.cantidad} = $${item.subtotal.toFixed(2)}</span>
                </div>
            `).join('')}
            <div class="total">
                Total: $${pedido.total.toFixed(2)}
            </div>
        </div>
        
        <div class="payment-info">
            <strong>💳 Información de pago:</strong><br>
            El pago del pedido se realiza al recibir los productos.
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
            <p style="margin: 0; color: #2d5016; font-weight: bold;">
                🌿 ¡Gracias por confiar en La Mandinga!
            </p>
        </div>
        
        <div class="footer">
            <p>Este es un mensaje automático. Por favor, no respondas a este correo.</p>
            <p>🌿 La Mandinga - Productos Saludables</p>
            <p style="font-size: 0.8em; color: #999;">
                Ruta Prov. 89 nº12890, Las Vegas - Potrerillos<br>
                Sábados y Domingos de 10 a 18hs
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

        // 🆕 Abrir modal de checkout - Actualizado
    openCheckout() {
        if (this.items.length === 0) {
            this.showNotification('El carrito está vacío', true);
            return;
        }

        const checkoutModal = document.getElementById('checkout-modal');
        if (!checkoutModal) {
            console.error('Modal de checkout no encontrado');
            return;
        }

        // Resetear formulario
        const form = document.getElementById('checkoutForm');
        form.reset();
        
        // Configurar estado inicial
        this.toggleCommunicationFields('whatsapp');
        this.toggleDeliveryFields('domicilio');
        
        // Actualizar resumen del pedido
        this.updateCheckoutSummary();
        checkoutModal.style.display = 'block';
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

    // 🆕 Actualizar resumen en checkout
    updateCheckoutSummary() {
        const summaryContainer = document.getElementById('order-items-summary');
        const totalElement = document.getElementById('checkout-total');
        
        if (!summaryContainer || !totalElement) return;

        const items = this.getOrderSummary();
        summaryContainer.innerHTML = items.map(item => `
            <div class="checkout-item">
                <span>${item.nombre} x ${item.cantidad}</span>
                <span>$${item.subtotal.toFixed(2)}</span>
            </div>
        `).join('');

        const total = this.getTotal();
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // 🆕 Guardar historial de pedidos
    saveOrderHistory(pedido) {
        const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        history.push(pedido);
        localStorage.setItem('orderHistory', JSON.stringify(history));
    }

    // 🆕 Mostrar confirmación del pedido
    showConfirmation(pedido) {
        const modal = document.getElementById('confirmation-modal');
        const details = document.getElementById('order-confirmation-details');
        
        if (!modal || !details) return;

        // Generar número de pedido formateado
        const orderNumber = `#${String(pedido.id).padStart(8, '0')}`;
        
        details.innerHTML = `
            <div class="confirmation-order-info">
                <div class="order-number">${orderNumber}</div>
                <div class="order-date">📅 ${pedido.fecha}</div>
            </div>
            <div class="confirmation-customer">
                <p><strong>Cliente:</strong> ${pedido.cliente.nombre}</p>
                <p><strong>Email:</strong> ${pedido.cliente.email}</p>
                <p><strong>Teléfono:</strong> ${pedido.cliente.telefono}</p>
                <p><strong>Dirección:</strong> ${pedido.cliente.direccion}</p>
            </div>
            <div class="confirmation-items">
                <h4>Productos</h4>
                ${pedido.items.map(item => `
                    <div class="confirmation-item">
                        <span>${item.nombre} x ${item.cantidad}</span>
                        <span>$${item.subtotal.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="confirmation-total">
                <strong>Total:</strong> <span>$${pedido.total.toFixed(2)}</span>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    // 🆕 Cerrar modales
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Abrir carrito
        document.getElementById('cartBtn').addEventListener('click', () => this.showCart());

        // Cerrar carrito
        document.getElementById('closeCart').addEventListener('click', () => {
            document.getElementById('cart-modal').style.display = 'none';
        });

        // 🆕 Abrir checkout desde el carrito
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            document.getElementById('cart-modal').style.display = 'none';
            this.openCheckout();
        });

        // 🆕 Cerrar checkout con 'X'
        document.getElementById('closeCheckout').addEventListener('click', () => {
            this.closeModal('checkout-modal');
        });

        // 🆕 Cancelar checkout con boton inferior
        document.getElementById('cancelarCheckout').addEventListener('click', () => {
            this.closeModal('checkout-modal');
        });

        // 🆕 Cerrar confirmación con 'X'
        document.getElementById('closeConfirmation').addEventListener('click', () => {
            this.closeModal('confirmation-modal');
        });

        // 🆕 Cerrar modales al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
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

// 🆕 Funciones globales para manejar los cambios
window.toggleCommunicationFields = function(metodo) {
    cart.toggleCommunicationFields(metodo);
};

window.toggleDeliveryFields = function(metodo) {
    cart.toggleDeliveryFields(metodo);
};

// Actualizar el event listener del formulario
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    
    // Procesar formulario de checkout
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Recopilar datos del formulario
        const metodoComunicacion = document.querySelector('input[name="metodoComunicacion"]:checked')?.value || 'whatsapp';
        const metodoEntrega = document.querySelector('input[name="metodoEntrega"]:checked')?.value || 'domicilio';
        
        let nombre = ''
        if (metodoEntrega === 'domicilio') {
            nombre = document.getElementById('customerName').value;
        } else {
            nombre = document.getElementById('customerNameRetiro').value;
        }
        
        const formData = {
            nombre: nombre,
            email: document.getElementById('customerEmail').value,
            telefono: document.getElementById('customerPhone').value,
            direccion: document.getElementById('customerAddress').value,
            metodoComunicacion: metodoComunicacion,
            metodoEntrega: metodoEntrega,
        };

        cart.processOrder(formData);
    });
});