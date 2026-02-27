// ========================================
// SHOPPING CART
// ========================================

const Cart = {
    items: [],

    // Initialize cart
    init() {
        this.loadCart();
        this.setupEventListeners();
        this.updateCartUI();
    },

    // Load cart from localStorage
    loadCart() {
        this.items = Storage.get('cart') || [];
    },

    // Save cart to localStorage
    saveCart() {
        Storage.set('cart', this.items);
        this.updateCartUI();
    },

    // Add item to cart
    addItem(productId, quantity = 1, options = {}) {
        // Find product in data - use helper for GitHub Pages compatibility
        const dataPath = Helpers.getDataPath('products.json');
        fetch(dataPath)
            .then(response => response.json())
            .then(data => {
                const product = data.products.find(p => p.id === productId);
                if (!product) {
                    Helpers.showToast('Product not found', 'error');
                    return;
                }

                // Check if item already exists in cart
                const existingItem = this.items.find(item =>
                    item.id === productId &&
                    JSON.stringify(item.options) === JSON.stringify(options)
                );

                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    this.items.push({
                        id: productId,
                        quantity: quantity,
                        options: options,
                        product: product
                    });
                }

                this.saveCart();
                Helpers.showToast('Product added to cart!', 'success');
                this.openCartOffcanvas();
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                Helpers.showToast('Failed to add product to cart', 'error');
            });
    },

    // Remove item from cart
    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        Helpers.showToast('Item removed from cart', 'success');
    },

    // Update item quantity
    updateQuantity(index, quantity) {
        if (quantity <= 0) {
            this.removeItem(index);
            return;
        }

        if (this.items[index]) {
            this.items[index].quantity = quantity;
            this.saveCart();
        }
    },

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            const price = item.product.salePrice || item.product.price;
            return total + (price * item.quantity);
        }, 0);
    },

    // Get cart item count
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    },

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
    },

    // Update cart UI
    updateCartUI() {
        // Update cart count badge
        const cartCountEl = document.getElementById('cartCount');
        if (cartCountEl) {
            const count = this.getItemCount();
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update cart offcanvas
        this.renderCartOffcanvas();
    },

    // Render cart offcanvas
    renderCartOffcanvas() {
        const cartBody = document.getElementById('cartBody');
        const cartFooter = document.getElementById('cartFooter');
        const cartSubtotal = document.getElementById('cartSubtotal');

        if (!cartBody) return;

        if (this.items.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-offcanvas__empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }

        // Render cart items
        cartBody.innerHTML = this.items.map((item, index) => {
            const price = item.product.salePrice || item.product.price;
            return `
                <div class="cart-item">
                    <div class="cart-item__image">
                        <img src="${item.product.images.main}" alt="${item.product.name}">
                    </div>
                    <div class="cart-item__details">
                        <a href="product-detail.html?id=${item.product.id}" class="cart-item__title">
                            ${item.product.name}
                        </a>
                        <div class="cart-item__price">${Helpers.formatPrice(price)}</div>
                        <div class="cart-item__quantity">
                            <button onclick="Cart.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" min="1" readonly>
                            <button onclick="Cart.updateQuantity(${index}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="cart-item__remove" onclick="Cart.removeItem(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');

        // Show footer and update subtotal
        if (cartFooter) {
            cartFooter.style.display = 'block';
        }
        if (cartSubtotal) {
            cartSubtotal.textContent = Helpers.formatPrice(this.getTotal());
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Cart button - open offcanvas
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCartOffcanvas());
        }

        // Close cart button
        const cartClose = document.getElementById('cartClose');
        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCartOffcanvas());
        }

        // Cart backdrop
        const cartBackdrop = document.getElementById('cartBackdrop');
        if (cartBackdrop) {
            cartBackdrop.addEventListener('click', () => this.closeCartOffcanvas());
        }
    },

    // Open cart offcanvas
    openCartOffcanvas() {
        const cartOffcanvas = document.getElementById('cartOffcanvas');
        const cartBackdrop = document.getElementById('cartBackdrop');

        if (cartOffcanvas) {
            cartOffcanvas.classList.add('active');
        }
        if (cartBackdrop) {
            cartBackdrop.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    },

    // Close cart offcanvas
    closeCartOffcanvas() {
        const cartOffcanvas = document.getElementById('cartOffcanvas');
        const cartBackdrop = document.getElementById('cartBackdrop');

        if (cartOffcanvas) {
            cartOffcanvas.classList.remove('active');
        }
        if (cartBackdrop) {
            cartBackdrop.classList.remove('active');
        }
        document.body.style.overflow = '';
    },

    // Render cart page (for cart.html)
    renderCartPage() {
        const tbody = document.querySelector('.cart-table tbody');
        const emptyMessage = document.getElementById('emptyCartMessage');
        const cartSection = document.querySelector('.cart-table')?.closest('.row');
        const subtotalEl = document.getElementById('cartSubtotalAmount');
        const taxEl = document.getElementById('taxAmount');
        const totalEl = document.getElementById('cartTotalAmount');

        if (!tbody) return;

        // Check if cart is empty
        if (this.items.length === 0) {
            if (cartSection) cartSection.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        // Show cart, hide empty message
        if (cartSection) cartSection.style.display = '';
        if (emptyMessage) emptyMessage.style.display = 'none';

        // Render cart items
        tbody.innerHTML = this.items.map((item, index) => {
            const product = item.product;
            const price = product.salePrice || product.price;
            const subtotal = price * item.quantity;

            return `
                <tr>
                    <td>
                        <button class="btn-remove" onclick="Cart.removeItem(${index}); Cart.renderCartPage();">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                    <td>
                        <a href="product-detail.html?id=${product.id}">
                            <img src="${product.images.main}" alt="${product.name}" class="cart-table__image">
                        </a>
                    </td>
                    <td>
                        <a href="product-detail.html?id=${product.id}" class="cart-table__product-name">
                            ${product.name}
                        </a>
                        ${item.options && Object.keys(item.options).length > 0 ? `
                            <div class="cart-table__options text-muted small">
                                ${Object.entries(item.options).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </div>
                        ` : ''}
                    </td>
                    <td>
                        ${product.salePrice ? `
                            <span class="text-decoration-line-through text-muted me-2">${Helpers.formatPrice(product.price)}</span>
                            <span class="text-primary fw-bold">${Helpers.formatPrice(product.salePrice)}</span>
                        ` : `
                            <span>${Helpers.formatPrice(product.price)}</span>
                        `}
                    </td>
                    <td>
                        <div class="cart-quantity">
                            <button class="cart-quantity__btn" onclick="Cart.updateQuantity(${index}, ${item.quantity - 1}); Cart.renderCartPage();">-</button>
                            <input type="number" class="cart-quantity__input" value="${item.quantity}" min="1" 
                                onchange="Cart.updateQuantity(${index}, parseInt(this.value) || 1); Cart.renderCartPage();">
                            <button class="cart-quantity__btn" onclick="Cart.updateQuantity(${index}, ${item.quantity + 1}); Cart.renderCartPage();">+</button>
                        </div>
                    </td>
                    <td>
                        <span class="fw-bold">${Helpers.formatPrice(subtotal)}</span>
                    </td>
                </tr>
            `;
        }).join('');

        // Update totals
        this.updateCartPageTotals();
    },

    // Update cart page totals
    updateCartPageTotals() {
        const subtotal = this.getTotal();
        const shippingSelect = document.getElementById('shippingMethod');
        
        let shippingCost = 0;
        if (shippingSelect) {
            const shippingValue = shippingSelect.value;
            if (shippingValue === 'standard') shippingCost = 5;
            if (shippingValue === 'express') shippingCost = 15;
        }

        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + shippingCost + tax;

        const subtotalEl = document.getElementById('cartSubtotalAmount');
        const taxEl = document.getElementById('taxAmount');
        const totalEl = document.getElementById('cartTotalAmount');

        if (subtotalEl) subtotalEl.textContent = Helpers.formatPrice(subtotal);
        if (taxEl) taxEl.textContent = Helpers.formatPrice(tax);
        if (totalEl) totalEl.textContent = Helpers.formatPrice(total);
    }
};

// Make Cart available globally
if (typeof window !== 'undefined') {
    window.Cart = Cart;
}
