// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart') || '[]');
        this.isOpen = false;
        this.taxRate = 0.08; // 8% tax rate
        
        console.log('Cart initialized with items:', this.items);
        console.log('Initial cart count:', this.items.length);
        
        this.init();
    }

    getCustomerIdFromStorage() {
        let customerId = localStorage.getItem('customerId');
        if (!customerId) {
            customerId = 'customer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('customerId', customerId);
        }
        return customerId;
    }

    init() {
        this.bindEvents();
        this.updateCartUI();
        this.updateCartCount();
    }

    bindEvents() {
        // Cart sidebar events
        document.getElementById('cartClose').addEventListener('click', this.close.bind(this));
        document.getElementById('cartOverlay').addEventListener('click', this.close.bind(this));
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', this.checkout.bind(this));
        }

        // Listen for escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    addItem(menuItem, size = 'medium', quantity = 1, customizations = {}) {
        console.log('Adding item to cart:', menuItem);
        console.log('Current cart items before add:', this.items);
        
        // Handle different price structures
        let price;
        if (typeof menuItem.price === 'object' && menuItem.price !== null) {
            price = menuItem.price[size] || menuItem.price.medium || menuItem.price.small || Object.values(menuItem.price)[0];
        } else {
            price = menuItem.price;
        }
        
        console.log('Item price structure:', menuItem.price);
        console.log('Selected size:', size);
        console.log('Calculated price:', price);
        
        const cartItem = {
            id: this.generateCartItemId(),
            menuItemId: menuItem.id,
            name: menuItem.name,
            image: menuItem.image,
            price: price,
            size: size,
            quantity: quantity,
            customizations: customizations,
            preparationTime: menuItem.preparationTime,
            addedAt: new Date().toISOString()
        };

        // Check if similar item already exists
        const existingItemIndex = this.items.findIndex(item => 
            item.menuItemId === menuItem.id && 
            item.size === size && 
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
        );

        if (existingItemIndex > -1) {
            // Update quantity of existing item
            this.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            this.items.push(cartItem);
        }

        this.saveCart();
        this.updateCartUI();
        this.updateCartCount();
        
        console.log('Item added successfully. Cart items after add:', this.items);
        console.log('Cart count after add:', this.getItemCount());
        
        // Show success animation
        this.animateCartIcon();
        
        return cartItem;
    }

    removeItem(cartItemId) {
        this.items = this.items.filter(item => item.id !== cartItemId);
        this.saveCart();
        this.updateCartUI();
        this.updateCartCount();
    }

    updateQuantity(cartItemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(cartItemId);
            return;
        }

        const item = this.items.find(item => item.id === cartItemId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartUI();
            this.updateCartCount();
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
        this.updateCartCount();
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax() {
        return this.getSubtotal() * this.taxRate;
    }

    getTotal() {
        return this.getSubtotal() + this.getTax();
    }

    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPreparationTime() {
        if (this.items.length === 0) return 0;
        return Math.max(...this.items.map(item => item.preparationTime || 0));
    }

    updateCartUI() {
        const cartBody = document.getElementById('cartBody');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');

        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            cartFooter.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartItems.style.display = 'block';
            cartFooter.style.display = 'block';
            
            this.renderCartItems();
            this.updateTotals();
        }
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = '';

        this.items.forEach(item => {
            const itemElement = this.createCartItemElement(item);
            cartItems.appendChild(itemElement);
        });
    }

    createCartItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.setAttribute('data-testid', `cart-item-${item.id}`);
        
        const itemTotal = item.price * item.quantity;
        
        itemDiv.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-name" data-testid="text-cart-item-name-${item.id}">${item.name}</h4>
                <div class="cart-item-meta">
                    <span class="cart-item-size">Size: ${this.formatSize(item.size)}</span>
                    ${Object.keys(item.customizations).length > 0 ? `
                        <div class="cart-item-customizations">
                            ${Object.entries(item.customizations).map(([key, value]) => 
                                `<span>${this.formatCustomization(key)}: ${value}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="cart-item-price" data-testid="text-cart-item-price-${item.id}">₨${item.price.toFixed(0)} each</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-id="${item.id}" data-testid="button-decrease-${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display" data-testid="text-quantity-${item.id}">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}" data-testid="button-increase-${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total" data-testid="text-cart-item-total-${item.id}">₨${itemTotal.toFixed(0)}</div>
                <button class="remove-item-btn" data-id="${item.id}" data-testid="button-remove-${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Add event listeners
        const decreaseBtn = itemDiv.querySelector('.decrease');
        const increaseBtn = itemDiv.querySelector('.increase');
        const removeBtn = itemDiv.querySelector('.remove-item-btn');

        decreaseBtn.addEventListener('click', () => {
            this.updateQuantity(item.id, item.quantity - 1);
        });

        increaseBtn.addEventListener('click', () => {
            this.updateQuantity(item.id, item.quantity + 1);
        });

        removeBtn.addEventListener('click', () => {
            this.removeItem(item.id);
            this.showToast(`${item.name} removed from cart`);
        });

        return itemDiv;
    }

    updateTotals() {
        const subtotal = this.getSubtotal();
        const tax = this.getTax();
        const total = this.getTotal();

        document.getElementById('cartSubtotal').textContent = `₨${subtotal.toFixed(0)}`;
        document.getElementById('cartTax').textContent = `₨${tax.toFixed(0)}`;
        document.getElementById('cartTotal').textContent = `₨${total.toFixed(0)}`;
    }

    updateCartCount() {
        const count = this.getItemCount();
        const cartCountElement = document.getElementById('cartCount');
        
        cartCountElement.textContent = count;
        cartCountElement.style.display = count > 0 ? 'flex' : 'none';
        
        // Animate count change
        cartCountElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCountElement.style.transform = 'scale(1)';
        }, 150);
    }

    animateCartIcon() {
        const cartToggle = document.getElementById('cartToggle');
        cartToggle.style.transform = 'scale(1.1)';
        cartToggle.style.color = 'var(--accent-gold)';
        
        setTimeout(() => {
            cartToggle.style.transform = 'scale(1)';
            cartToggle.style.color = '';
        }, 300);
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Focus on close button for accessibility
        setTimeout(() => {
            document.getElementById('cartClose').focus();
        }, 300);
    }

    close() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    checkout() {
        console.log('Checkout called - Items in cart:', this.items);
        console.log('Items length:', this.items.length);
        
        if (this.items.length === 0) {
            console.error('Cart appears empty but checkout was called');
            this.showToast('Your cart is empty');
            return;
        }

        // Get table information from MenuApp if QR scan
        const menuApp = window.menuApp;
        const tableNumber = menuApp?.tableNumber || null;
        const restaurantId = menuApp?.restaurantId || null;
        
        // Direct checkout without payment method selection
        const orderSummary = {
            items: this.items,
            subtotal: this.getSubtotal(),
            total: this.getSubtotal(), // Remove tax from total
            estimatedTime: this.getTotalPreparationTime(),
            orderNumber: this.generateOrderNumber(),
            tableNumber: tableNumber,
            restaurantId: restaurantId
        };

        console.log('Checkout initiated:', orderSummary);
        console.log('Restaurant ID from MenuApp:', menuApp?.restaurantId);
        console.log('Table Number:', tableNumber);
        
        // Show checkout confirmation
        this.showCheckoutModal(orderSummary);
    }

    showCheckoutModal(orderSummary) {
        // Remove any existing checkout modals first
        const existingModals = document.querySelectorAll('.checkout-modal');
        existingModals.forEach(modal => modal.remove());
        
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.innerHTML = `
            <div class="checkout-overlay"></div>
            <div class="checkout-content">
                <div class="checkout-header">
                    <h2>Order Confirmation</h2>
                    <button class="checkout-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="checkout-body">
                    <div class="order-summary">
                        <h3>Order #${orderSummary.orderNumber}</h3>\n                        ${orderSummary.tableNumber ? `<p style=\"background: linear-gradient(135deg, #d4af37, #f7e98e); color: #000; padding: 6px 12px; border-radius: 15px; margin: 8px 0; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;\"><i class=\"fas fa-table\"></i> Table ${orderSummary.tableNumber}</p>` : ''}
                        <p>Estimated preparation time: ${orderSummary.estimatedTime} minutes</p>
                        
                        <div class="order-items">
                            ${orderSummary.items.map(item => `
                                <div class="order-item">
                                    <span>${item.name} (${this.formatSize(item.size)}) x${item.quantity}</span>
                                    <span>₨${(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="order-totals">
                            <div class="total-line final">
                                <span>Total:</span>
                                <span>₨${orderSummary.total.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="checkout-footer">
                    <button class="btn-secondary cancel-order">Cancel</button>
                    <button class="btn-primary confirm-order">Place Order</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');

        // Event listeners for modal
        modal.querySelector('.checkout-close').addEventListener('click', () => {
            this.closeCheckoutModal(modal);
        });
        
        modal.querySelector('.checkout-overlay').addEventListener('click', () => {
            this.closeCheckoutModal(modal);
        });
        
        modal.querySelector('.cancel-order').addEventListener('click', () => {
            this.closeCheckoutModal(modal);
        });
        
        modal.querySelector('.confirm-order').addEventListener('click', () => {
            this.confirmOrder(orderSummary);
            this.closeCheckoutModal(modal);
        });

        // Auto-focus confirm button since no payment method selection needed
    }

    closeCheckoutModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    async confirmOrder(orderSummary) {
        try {
            // Get customer ID for order tracking
            const customerId = this.getCustomerIdFromStorage();
            
            // Send order to server with table information
            const orderData = {
                items: orderSummary.items.map(item => ({
                    menuItemId: item.menuItemId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size,
                    customizations: item.customizations
                })),
                subtotal: orderSummary.subtotal,
                total: orderSummary.total,
                tableNumber: orderSummary.tableNumber,
                restaurantId: orderSummary.restaurantId,
                customerId: customerId,
                estimatedTime: orderSummary.estimatedTime,
                orderNumber: orderSummary.orderNumber,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            const response = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'customer-id': customerId
                },
                body: JSON.stringify(orderData)
            });
            
            const responseData = await response.text();
            
            if (response.ok) {
                console.log('Order confirmed:', orderSummary);
                console.log('Order data sent:', orderData);
                console.log('API Response:', responseData);
                this.showToast('Order placed successfully!');
                
                // Save order to history
                this.saveOrderToHistory(orderSummary);
                
                this.clearCart();
                this.close();
                
                // Force update order history icon and event listeners after order placement
                setTimeout(() => {
                    if (window.menuApp && window.menuApp.updateOrderHistoryIcon) {
                        window.menuApp.updateOrderHistoryIcon();
                        console.log('🔄 Forced order history icon update after order placement');
                    }
                }, 500);
                
                // Show order tracking notification
                setTimeout(() => {
                    this.showOrderTrackingNotification(orderSummary.orderNumber);
                }, 1000);
            } else {
                console.error('Order placement failed:', responseData);
                throw new Error(`Failed to place order: ${responseData}`);
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            this.showToast('Failed to place order. Please try again.');
        }
    }

    showOrderTrackingNotification(orderNumber) {
        const notification = document.createElement('div');
        notification.className = 'order-notification';
        notification.innerHTML = `
            <div class="notification-content" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: 12px;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                ">
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: rgba(255,255,255,0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                    ">✓</div>
                    <div class="notification-text">
                        <h4 style="margin: 0; font-size: 16px; font-weight: 600;">Order Confirmed!</h4>
                        <p style="margin: 2px 0 0 0; font-size: 13px; opacity: 0.9;">Order #${orderNumber} is being prepared</p>
                    </div>
                </div>
                <button class="track-order-btn" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    width: 100%;
                ">View Order History</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-green);
            color: white;
            padding: 20px;
            border-radius: 12px;
            z-index: 999999;
            animation: slideInRight 0.5s ease;
            max-width: 320px;
            min-width: 280px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            border: 2px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            font-family: inherit;
        `;
        
        document.body.appendChild(notification);
        
        // Add event listener to track order button
        const trackBtn = notification.querySelector('.track-order-btn');
        if (trackBtn) {
            trackBtn.addEventListener('click', () => {
                this.showOrderHistory();
                notification.remove();
            });
        }
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease forwards';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }

    saveCart() {
        console.log('Saving cart to localStorage:', this.items);
        localStorage.setItem('cart', JSON.stringify(this.items));
        
        // Verify save
        const saved = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('Verified saved cart:', saved);
    }

    generateCartItemId() {
        return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateOrderNumber() {
        return 'ORD' + Date.now().toString().slice(-6);
    }

    formatSize(size) {
        return size.charAt(0).toUpperCase() + size.slice(1);
    }

    formatCustomization(key) {
        return key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'cart-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-gold);
            color: var(--primary-dark);
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    async showOrderHistory() {
        try {
            // Use MenuApp's order history if available
            if (window.menuApp && window.menuApp.toggleOrderHistory) {
                window.menuApp.toggleOrderHistory();
                return;
            }
            
            // Fallback to localStorage
            const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            
            const modal = document.createElement('div');
            modal.className = 'order-history-modal';
            modal.innerHTML = `
                <div class="checkout-overlay"></div>
                <div class="checkout-content">
                    <div class="checkout-header">
                        <h2>Order History</h2>
                        <button class="checkout-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="checkout-body">
                        ${orders.length === 0 ? `
                            <div class="empty-orders">
                                <i class="fas fa-receipt"></i>
                                <p>No orders found</p>
                                <small>Your order history will appear here</small>
                            </div>
                        ` : `
                            <div class="order-history-list">
                                ${orders.slice(-10).reverse().map(order => `
                                    <div class="order-history-item">
                                        <div class="order-header">
                                            <h4>Order #${order.orderNumber}</h4>
                                            <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div class="order-details">
                                            ${order.tableNumber ? `<p><i class="fas fa-table"></i> Table ${order.tableNumber}</p>` : ''}
                                            <p><i class="fas fa-clock"></i> ${order.estimatedTime} minutes</p>
                                            <p><i class="fas fa-rupee-sign"></i> ₨${order.total.toFixed(0)}</p>
                                        </div>
                                        <div class="order-items-summary">
                                            ${order.items.slice(0, 2).map(item => `
                                                <span class="item-name">${item.name} x${item.quantity}</span>
                                            `).join('')}
                                            ${order.items.length > 2 ? `<span class="more-items">+${order.items.length - 2} more</span>` : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    <div class="checkout-footer">
                        <button class="btn-primary close-history">Close</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.classList.add('active');

            // Event listeners
            modal.querySelector('.checkout-close').addEventListener('click', () => {
                this.closeOrderHistoryModal(modal);
            });
            
            modal.querySelector('.checkout-overlay').addEventListener('click', () => {
                this.closeOrderHistoryModal(modal);
            });
            
            modal.querySelector('.close-history').addEventListener('click', () => {
                this.closeOrderHistoryModal(modal);
            });

        } catch (error) {
            console.error('Error showing order history:', error);
            this.showToast('Failed to load order history');
        }
    }

    closeOrderHistoryModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    saveOrderToHistory(orderSummary) {
        try {
            const order = {
                id: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                orderNumber: orderSummary.orderNumber,
                items: orderSummary.items,
                subtotal: orderSummary.subtotal,
                tax: orderSummary.tax || 0,
                total: orderSummary.total,
                tableNumber: orderSummary.tableNumber,
                restaurantId: orderSummary.restaurantId,
                estimatedTime: orderSummary.estimatedTime,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            
            console.log('💾 Saving order to history:', order);
            console.log('🔍 OrderSummary received:', orderSummary);
            console.log('🔍 MenuApp available:', !!window.menuApp);
            console.log('🔍 MenuApp.addToOrderHistory available:', !!(window.menuApp && window.menuApp.addToOrderHistory));
            
            // Always save to both MenuApp and localStorage for consistency
            if (window.menuApp && window.menuApp.addToOrderHistory) {
                console.log('✅ Adding order to MenuApp history');
                window.menuApp.addToOrderHistory(order);
                
                // Double check if it was saved
                const savedHistory = localStorage.getItem('orderHistory');
                console.log('🔍 After MenuApp save - localStorage orderHistory:', savedHistory);
            } else {
                console.warn('⚠️ MenuApp not available, using localStorage fallback');
                // Fallback to localStorage
                const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
                console.log('🔍 Existing orders before save:', orders);
                orders.unshift(order);
                localStorage.setItem('orderHistory', JSON.stringify(orders));
                console.log('🔍 Orders after save:', orders);
                
                // Also update the icon manually if MenuApp isn't available
                const orderHistoryToggle = document.getElementById('orderHistoryToggle');
                if (orderHistoryToggle) {
                    orderHistoryToggle.style.display = 'flex';
                }
            }
            
            console.log('✅ Order saved to history successfully');
            
            // Force verification
            const finalHistory = localStorage.getItem('orderHistory');
            console.log('🔍 Final verification - localStorage orderHistory:', finalHistory);
        } catch (error) {
            console.error('Error saving order to history:', error);
        }
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
});

// Add cart-specific CSS
const cartStyle = document.createElement('style');
cartStyle.textContent = `
    .cart-sidebar {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 400px;
        background: var(--card-background);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
    }
    
    .cart-sidebar.active {
        transform: translateX(0);
    }
    
    .cart-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .cart-sidebar.active ~ .cart-overlay,
    .cart-sidebar.active .cart-overlay {
        opacity: 1;
        visibility: visible;
    }
    
    .cart-content {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 10001;
    }
    
    .cart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .cart-header h3 {
        color: var(--text-primary);
        font-size: 20px;
        font-weight: 600;
    }
    
    .cart-close {
        width: 40px;
        height: 40px;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: 50%;
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .cart-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }
    
    .cart-body {
        flex: 1;
        overflow-y: auto;
        padding: var(--spacing-lg);
    }
    
    .cart-empty {
        text-align: center;
        padding: var(--spacing-2xl) var(--spacing-lg);
        color: var(--text-secondary);
    }
    
    .cart-empty i {
        font-size: 48px;
        margin-bottom: var(--spacing-lg);
        opacity: 0.5;
    }
    
    .cart-empty p {
        font-size: 18px;
        margin-bottom: var(--spacing-sm);
    }
    
    .cart-empty small {
        font-size: 14px;
        opacity: 0.7;
    }
    
    .cart-item {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-md) 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .cart-item:last-child {
        border-bottom: none;
    }
    
    .cart-item-image {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-md);
        overflow: hidden;
        flex-shrink: 0;
    }
    
    .cart-item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .cart-item-details {
        flex: 1;
        min-width: 0;
    }
    
    .cart-item-name {
        color: var(--text-primary);
        font-size: 16px;
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
        line-height: 1.3;
    }
    
    .cart-item-meta {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
    }
    
    .cart-item-customizations {
        margin-top: var(--spacing-xs);
    }
    
    .cart-item-customizations span {
        display: block;
        font-size: 11px;
        color: var(--text-secondary);
    }
    
    .cart-item-price {
        font-size: 14px;
        color: var(--accent-gold);
        font-weight: 600;
    }
    
    .cart-item-controls {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--spacing-xs);
        flex-shrink: 0;
    }
    
    .quantity-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
        padding: var(--spacing-xs);
    }
    
    .quantity-btn {
        width: 28px;
        height: 28px;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
    }
    
    .quantity-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }
    
    .quantity-display {
        min-width: 24px;
        text-align: center;
        font-weight: 600;
        color: var(--text-primary);
        font-size: 14px;
    }
    
    .cart-item-total {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .remove-item-btn {
        width: 32px;
        height: 32px;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .remove-item-btn:hover {
        background: rgba(255, 68, 68, 0.2);
        color: var(--warning-red);
    }
    
    .cart-footer {
        padding: var(--spacing-lg);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: var(--secondary-dark);
    }
    
    .cart-total {
        margin-bottom: var(--spacing-lg);
    }
    
    .subtotal, .tax, .total {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
    }
    
    .total {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: var(--spacing-sm);
        margin-top: var(--spacing-sm);
    }
    
    .checkout-btn {
        width: 100%;
        height: 50px;
        background: var(--accent-gold);
        border: none;
        color: var(--primary-dark);
        font-size: 16px;
        font-weight: 600;
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
    }
    
    .checkout-btn:hover {
        background: var(--accent-amber);
        transform: translateY(-1px);
    }
    
    .checkout-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .checkout-modal.active {
        opacity: 1;
        visibility: visible;
    }
    
    .checkout-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
    }
    
    .checkout-content {
        background: var(--card-background);
        border-radius: var(--radius-xl);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .checkout-modal.active .checkout-content {
        transform: scale(1);
    }
    
    .checkout-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .checkout-header h2 {
        color: var(--text-primary);
        font-size: 20px;
        font-weight: 600;
    }
    
    .checkout-close {
        width: 36px;
        height: 36px;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: 50%;
        transition: var(--transition-fast);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .checkout-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }
    
    .checkout-body {
        padding: var(--spacing-lg);
    }
    
    .order-summary h3 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-sm);
    }
    
    .order-items {
        margin: var(--spacing-lg) 0;
    }
    
    .order-item {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-sm) 0;
        color: var(--text-secondary);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .order-totals {
        margin-top: var(--spacing-lg);
        padding-top: var(--spacing-lg);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .total-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
        color: var(--text-secondary);
    }
    
    .total-line.final {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: var(--spacing-sm);
        margin-top: var(--spacing-sm);
    }
    
    .payment-options {
        margin-top: var(--spacing-xl);
    }
    
    .payment-options h4 {
        color: var(--text-primary);
        margin-bottom: var(--spacing-md);
    }
    
    .payment-methods {
        display: grid;
        gap: var(--spacing-sm);
    }
    
    .payment-method {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid transparent;
        color: var(--text-secondary);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: var(--transition-fast);
    }
    
    .payment-method:hover,
    .payment-method.selected {
        border-color: var(--accent-gold);
        color: var(--text-primary);
        background: rgba(255, 165, 0, 0.1);
    }
    
    .checkout-footer {
        display: flex;
        gap: var(--spacing-md);
        padding: var(--spacing-lg);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        background: var(--secondary-dark);
    }
    
    .order-notification {
        box-shadow: var(--shadow-lg);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
    }
    
    .notification-text h4 {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: 16px;
    }
    
    .notification-text p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
    }
    
    .track-order-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--radius-sm);
        font-size: 12px;
        cursor: pointer;
        transition: var(--transition-fast);
    }
    
    .track-order-btn:hover {
        background: rgba(255, 255, 255, 0.3);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @media (max-width: 480px) {
        .cart-sidebar {
            max-width: 100%;
        }
        
        .checkout-content {
            width: 95%;
            margin: 20px;
        }
        
        .checkout-footer {
            flex-direction: column;
        }
        
        .payment-methods {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(cartStyle);