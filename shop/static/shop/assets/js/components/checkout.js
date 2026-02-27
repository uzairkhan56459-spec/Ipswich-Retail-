// ========================================
// CHECKOUT FUNCTIONALITY
// ========================================

const Checkout = {
    cartItems: [],
    subtotal: 0,
    shipping: 5.99,
    tax: 0,
    discount: 0,
    codFee: 0,
    total: 0,
    appliedCoupon: null,
    currentStep: 2, // Start at shipping (step 2)

    // Valid coupon codes
    validCoupons: {
        'SAVE10': { type: 'percent', value: 10, minOrder: 0 },
        'SAVE20': { type: 'percent', value: 20, minOrder: 50 },
        'FLAT15': { type: 'fixed', value: 15, minOrder: 75 },
        'FREESHIP': { type: 'shipping', value: 0, minOrder: 100 },
        'WELCOME': { type: 'percent', value: 15, minOrder: 0 }
    },

    // Initialize checkout
    init() {
        this.loadCartItems();
        this.setupEventListeners();
        this.setupProgressTracking();
        this.calculateTotals();
        this.updateUI();
        this.checkFreeShipping();
        this.updateProgress(2); // Start at shipping
    },

    // Load cart items
    loadCartItems() {
        this.cartItems = Storage.get('cart') || [];
        
        if (this.cartItems.length === 0) {
            // Redirect to cart if empty
            window.location.href = 'cart.html';
            return;
        }
        
        this.renderCartItems();
    },

    // Render cart items in sidebar
    renderCartItems() {
        const container = document.getElementById('checkoutItems');
        if (!container) return;

        container.innerHTML = this.cartItems.map(item => {
            const product = item.product;
            const price = product.salePrice || product.price;
            const image = product.images?.main || product.image || '../assets/images/products/placeholder.jpg';
            
            return `
                <div class="order-item">
                    <div class="order-item__image">
                        <img src="${image}" alt="${product.name}">
                        <span class="order-item__quantity">${item.quantity}</span>
                    </div>
                    <div class="order-item__details">
                        <h4>${product.name}</h4>
                        <p class="order-item__price">${Helpers.formatPrice(price)} × ${item.quantity}</p>
                    </div>
                    <div class="order-item__total">
                        ${Helpers.formatPrice(price * item.quantity)}
                    </div>
                </div>
            `;
        }).join('');
    },

    // Setup event listeners
    setupEventListeners() {
        // Shipping method change
        document.querySelectorAll('input[name="shippingMethod"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.shipping = parseFloat(e.target.dataset.price);
                this.calculateTotals();
                this.updateUI();
            });
        });

        // Payment method change
        document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });

        // Billing address toggle
        const billingDifferent = document.getElementById('billingDifferent');
        if (billingDifferent) {
            billingDifferent.addEventListener('change', (e) => {
                document.getElementById('billingAddress').style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Coupon toggle
        const couponToggle = document.getElementById('couponToggle');
        if (couponToggle) {
            couponToggle.addEventListener('click', () => {
                const form = document.getElementById('couponForm');
                form.style.display = form.style.display === 'none' ? 'flex' : 'none';
            });
        }

        // Apply coupon
        const applyCouponBtn = document.getElementById('applyCoupon');
        if (applyCouponBtn) {
            applyCouponBtn.addEventListener('click', () => this.applyCoupon());
        }

        // Remove coupon
        const removeCouponBtn = document.getElementById('removeCoupon');
        if (removeCouponBtn) {
            removeCouponBtn.addEventListener('click', () => this.removeCoupon());
        }

        // Coupon input enter key
        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyCoupon();
                }
            });
        }

        // Card number formatting
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => this.formatCardNumber(e));
        }

        // Card expiry formatting
        const cardExpiry = document.getElementById('cardExpiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => this.formatExpiry(e));
        }

        // CVV - numbers only
        const cardCvv = document.getElementById('cardCvv');
        if (cardCvv) {
            cardCvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }

        // Place order
        const placeOrderBtn = document.getElementById('placeOrderBtn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => this.placeOrder());
        }

        // Express checkout buttons
        document.querySelectorAll('.express-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showNotification('Express checkout coming soon!', 'info');
            });
        });
    },

    // Setup progress tracking based on form input
    setupProgressTracking() {
        // Contact section fields
        const contactFields = ['email', 'phone'];
        contactFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('blur', () => this.checkProgress());
                field.addEventListener('input', () => this.checkProgress());
            }
        });

        // Shipping section fields
        const shippingFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zip', 'country'];
        shippingFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('blur', () => this.checkProgress());
                field.addEventListener('input', () => this.checkProgress());
            }
        });

        // Shipping method
        document.querySelectorAll('input[name="shippingMethod"]').forEach(input => {
            input.addEventListener('change', () => this.checkProgress());
        });

        // Payment method
        document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
            input.addEventListener('change', () => this.checkProgress());
        });

        // Card fields
        const cardFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCvv'];
        cardFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('blur', () => this.checkProgress());
                field.addEventListener('input', () => this.checkProgress());
            }
        });
    },

    // Check and update progress based on filled fields
    checkProgress() {
        // Check if contact info is filled
        const email = document.getElementById('email')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const contactComplete = email && phone && this.isValidEmail(email);

        // Check if shipping info is filled
        const firstName = document.getElementById('firstName')?.value.trim();
        const lastName = document.getElementById('lastName')?.value.trim();
        const address = document.getElementById('address')?.value.trim();
        const city = document.getElementById('city')?.value.trim();
        const state = document.getElementById('state')?.value.trim();
        const zip = document.getElementById('zip')?.value.trim();
        const country = document.getElementById('country')?.value;
        const shippingComplete = firstName && lastName && address && city && state && zip && country;

        // Check if shipping method is selected
        const shippingMethod = document.querySelector('input[name="shippingMethod"]:checked');

        // Check if payment info is filled
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value;
        let paymentComplete = false;

        if (paymentMethod === 'card') {
            const cardNumber = document.getElementById('cardNumber')?.value.replace(/\s/g, '');
            const cardName = document.getElementById('cardName')?.value.trim();
            const cardExpiry = document.getElementById('cardExpiry')?.value.trim();
            const cardCvv = document.getElementById('cardCvv')?.value.trim();
            paymentComplete = cardNumber?.length >= 16 && cardName && cardExpiry?.length >= 5 && cardCvv?.length >= 3;
        } else if (paymentMethod) {
            // PayPal, COD, Bank Transfer - just need method selected
            paymentComplete = true;
        }

        // Determine current step based on user's current position
        // If user has selected a payment method OR started filling card details, they're on payment step
        const paymentStarted = paymentMethod || document.getElementById('cardNumber')?.value.length > 0;

        if (paymentComplete && shippingComplete && contactComplete && shippingMethod) {
            this.updateProgress(4); // Ready for confirmation
        } else if (paymentStarted) {
            this.updateProgress(3); // User is on payment step
        } else if (shippingMethod || shippingComplete) {
            this.updateProgress(3); // Shipping done, moving to payment
        } else {
            this.updateProgress(2); // Still on shipping
        }
    },

    // Update progress indicator UI
    updateProgress(step) {
        this.currentStep = step;
        const steps = document.querySelectorAll('.checkout-progress__step');
        const lines = document.querySelectorAll('.checkout-progress__line');

        steps.forEach((stepEl, index) => {
            const stepNum = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNum < step) {
                stepEl.classList.add('completed');
            } else if (stepNum === step) {
                stepEl.classList.add('active');
            }
        });

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            line.classList.remove('completed');
            
            if (lineNum < step) {
                line.classList.add('completed');
            }
        });
    },

    // Email validation helper
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Handle payment method change
    handlePaymentMethodChange(method) {
        const cardDetails = document.getElementById('cardDetails');
        const codFeeRow = document.getElementById('codFeeRow');
        
        // Show/hide card details
        if (cardDetails) {
            cardDetails.style.display = method === 'card' ? 'block' : 'none';
        }

        // Handle COD fee
        if (method === 'cod') {
            this.codFee = 2.99;
            if (codFeeRow) codFeeRow.style.display = 'flex';
        } else {
            this.codFee = 0;
            if (codFeeRow) codFeeRow.style.display = 'none';
        }

        this.calculateTotals();
        this.updateUI();
    },

    // Format card number
    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        let formatted = '';
        
        for (let i = 0; i < value.length && i < 16; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += value[i];
        }
        
        e.target.value = formatted;
        
        // Detect card type
        this.detectCardType(value);
    },

    // Detect card type
    detectCardType(number) {
        const cardType = document.getElementById('cardType');
        if (!cardType) return;

        let icon = '';
        
        if (/^4/.test(number)) {
            icon = '<i class="fab fa-cc-visa"></i>';
        } else if (/^5[1-5]/.test(number)) {
            icon = '<i class="fab fa-cc-mastercard"></i>';
        } else if (/^3[47]/.test(number)) {
            icon = '<i class="fab fa-cc-amex"></i>';
        } else if (/^6(?:011|5)/.test(number)) {
            icon = '<i class="fab fa-cc-discover"></i>';
        }
        
        cardType.innerHTML = icon;
    },

    // Format expiry date
    formatExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        
        e.target.value = value;
    },

    // Apply coupon
    applyCoupon() {
        const code = document.getElementById('couponCode').value.trim().toUpperCase();
        const errorEl = document.getElementById('couponError');
        const appliedEl = document.getElementById('couponApplied');
        const formEl = document.getElementById('couponForm');
        
        if (!code) {
            this.showCouponError('Please enter a coupon code');
            return;
        }

        const coupon = this.validCoupons[code];
        
        if (!coupon) {
            this.showCouponError('Invalid coupon code');
            return;
        }

        if (this.subtotal < coupon.minOrder) {
            this.showCouponError(`Minimum order of ${Helpers.formatPrice(coupon.minOrder)} required`);
            return;
        }

        // Apply coupon
        this.appliedCoupon = { code, ...coupon };
        
        // Update UI
        document.getElementById('appliedCouponCode').textContent = code;
        formEl.style.display = 'none';
        appliedEl.style.display = 'flex';
        errorEl.style.display = 'none';
        document.getElementById('couponToggle').style.display = 'none';

        this.calculateTotals();
        this.updateUI();
        
        this.showNotification('Coupon applied successfully!', 'success');
    },

    // Show coupon error
    showCouponError(message) {
        const errorEl = document.getElementById('couponError');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        
        setTimeout(() => {
            errorEl.style.display = 'none';
        }, 3000);
    },

    // Remove coupon
    removeCoupon() {
        this.appliedCoupon = null;
        this.discount = 0;
        
        document.getElementById('couponApplied').style.display = 'none';
        document.getElementById('couponForm').style.display = 'none';
        document.getElementById('couponToggle').style.display = 'flex';
        document.getElementById('couponCode').value = '';
        
        this.calculateTotals();
        this.updateUI();
        
        this.showNotification('Coupon removed', 'info');
    },

    // Calculate totals
    calculateTotals() {
        // Calculate subtotal
        this.subtotal = this.cartItems.reduce((sum, item) => {
            const product = item.product;
            const price = product.salePrice || product.price;
            return sum + (price * item.quantity);
        }, 0);

        // Calculate discount
        this.discount = 0;
        if (this.appliedCoupon) {
            if (this.appliedCoupon.type === 'percent') {
                this.discount = (this.subtotal * this.appliedCoupon.value) / 100;
            } else if (this.appliedCoupon.type === 'fixed') {
                this.discount = this.appliedCoupon.value;
            } else if (this.appliedCoupon.type === 'shipping') {
                this.shipping = 0;
            }
        }

        // Calculate tax (8% of subtotal after discount)
        const taxableAmount = this.subtotal - this.discount;
        this.tax = taxableAmount * 0.08;

        // Calculate total
        this.total = this.subtotal - this.discount + this.shipping + this.tax + this.codFee;
    },

    // Update UI
    updateUI() {
        document.getElementById('subtotal').textContent = Helpers.formatPrice(this.subtotal);
        document.getElementById('shipping').textContent = this.shipping === 0 ? 'FREE' : Helpers.formatPrice(this.shipping);
        document.getElementById('tax').textContent = Helpers.formatPrice(this.tax);
        document.getElementById('total').textContent = Helpers.formatPrice(this.total);
        document.getElementById('btnTotal').textContent = Helpers.formatPrice(this.total);

        // Show/hide discount row
        const discountRow = document.getElementById('discountRow');
        if (this.discount > 0) {
            discountRow.style.display = 'flex';
            document.getElementById('discount').textContent = `-${Helpers.formatPrice(this.discount)}`;
        } else {
            discountRow.style.display = 'none';
        }

        // Update COD fee
        if (this.codFee > 0) {
            document.getElementById('codFee').textContent = Helpers.formatPrice(this.codFee);
        }
    },

    // Check for free shipping
    checkFreeShipping() {
        const freeShippingOption = document.getElementById('freeShippingOption');
        
        if (this.subtotal >= 100) {
            if (freeShippingOption) {
                freeShippingOption.style.display = 'block';
                // Auto-select free shipping
                freeShippingOption.querySelector('input').checked = true;
                this.shipping = 0;
                this.calculateTotals();
                this.updateUI();
            }
        }
    },

    // Validate form
    validateForm() {
        const requiredFields = [
            { id: 'email', name: 'Email' },
            { id: 'phone', name: 'Phone' },
            { id: 'firstName', name: 'First Name' },
            { id: 'lastName', name: 'Last Name' },
            { id: 'address', name: 'Address' },
            { id: 'city', name: 'City' },
            { id: 'state', name: 'State' },
            { id: 'zip', name: 'ZIP Code' },
            { id: 'country', name: 'Country' }
        ];

        for (const field of requiredFields) {
            const input = document.getElementById(field.id);
            if (!input || !input.value.trim()) {
                this.showNotification(`Please enter your ${field.name}`, 'error');
                input?.focus();
                return false;
            }
        }

        // Validate email format
        const email = document.getElementById('email').value;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        // Validate payment
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        if (paymentMethod === 'card') {
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const cardName = document.getElementById('cardName').value;
            const cardExpiry = document.getElementById('cardExpiry').value;
            const cardCvv = document.getElementById('cardCvv').value;

            if (cardNumber.length < 16) {
                this.showNotification('Please enter a valid card number', 'error');
                return false;
            }
            if (!cardName.trim()) {
                this.showNotification('Please enter the name on card', 'error');
                return false;
            }
            if (cardExpiry.length < 5) {
                this.showNotification('Please enter a valid expiry date', 'error');
                return false;
            }
            if (cardCvv.length < 3) {
                this.showNotification('Please enter a valid CVV', 'error');
                return false;
            }
        }

        // Validate terms
        if (!document.getElementById('agreeTerms').checked) {
            this.showNotification('Please agree to the Terms & Conditions', 'error');
            return false;
        }

        return true;
    },

    // Place order
    placeOrder() {
        if (!this.validateForm()) {
            return;
        }

        const placeOrderBtn = document.getElementById('placeOrderBtn');
        placeOrderBtn.classList.add('loading');
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate order processing
        setTimeout(() => {
            // Generate order number
            const orderNumber = this.generateOrderNumber();
            const email = document.getElementById('email').value;

            // Save order to storage
            this.saveOrder(orderNumber);

            // Clear cart
            Storage.set('cart', []);

            // Update modal with order details
            document.getElementById('orderNumber').textContent = orderNumber;
            document.getElementById('confirmationEmail').textContent = email;

            // Show success modal
            document.getElementById('orderSuccessModal').classList.add('active');

            // Reset button
            placeOrderBtn.classList.remove('loading');
            placeOrderBtn.innerHTML = '<i class="fas fa-lock"></i><span>Place Order</span><span class="order-total">' + Helpers.formatPrice(this.total) + '</span>';

        }, 2000);
    },

    // Generate order number
    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 90000) + 10000;
        return `#HG-${year}-${random}`;
    },

    // Save order
    saveOrder(orderNumber) {
        const 
        orders = Storage.get('orders') || [];
        
        const order = {
            orderNumber,
            date: new Date().toISOString(),
            items: this.cartItems,
            subtotal: this.subtotal,
            shipping: this.shipping,
            tax: this.tax,
            discount: this.discount,
            total: this.total,
            shippingAddress: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value
            },
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
            status: 'confirmed'
        };

        orders.push(order);
        Storage.set('orders', orders);
    },

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.checkout-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `checkout-notification checkout-notification--${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Checkout.init();
});

// Make Checkout available globally
if (typeof window !== 'undefined') {
    window.Checkout = Checkout;
}
