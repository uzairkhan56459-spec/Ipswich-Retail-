// ========================================
// QUICK VIEW MODAL
// ========================================

const QuickView = {
    currentProduct: null,

    // Initialize quick view
    init() {
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        const closeBtn = document.getElementById('quickViewClose');
        const backdrop = document.getElementById('quickViewBackdrop');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => this.close());
        }

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    },

    // Open quick view modal
    async open(productId) {
        const product = ProductGrid.getProductById(productId);

        if (!product) {
            Helpers.showToast('Product not found', 'error');
            return;
        }

        this.currentProduct = product;
        this.render();
        this.show();
    },

    // Render quick view content
    render() {
        const content = document.getElementById('quickViewContent');
        if (!content) return;

        const product = this.currentProduct;
        const price = product.salePrice || product.price;
        const hasDiscount = product.salePrice && product.salePrice < product.price;
        const isInWishlist = Wishlist.hasItem(product.id);

        content.innerHTML = `
            <div class="quick-view">
                <!-- Product Images -->
                <div class="quick-view__gallery">
                    <div class="quick-view__main-image">
                        ${product.badge ? `<span class="quick-view__badge quick-view__badge--${product.badge}">${product.badge === 'sale' ? `-${product.discount}%` : product.badge}</span>` : ''}
                        <img src="${product.images.main}" alt="${product.name}" id="quickViewMainImage">
                    </div>
                    <div class="quick-view__thumbnails">
                        ${product.images.gallery.map((img, index) => `
                            <button class="quick-view__thumb ${index === 0 ? 'active' : ''}"
                                    onclick="QuickView.changeImage('${img}', this)">
                                <img src="${img}" alt="${product.name}">
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Product Info -->
                <div class="quick-view__info">
                    <div class="quick-view__category">${product.category}</div>
                    <h2 class="quick-view__title">${product.name}</h2>

                    <div class="quick-view__rating">
                        <div class="quick-view__stars">${Helpers.generateStars(product.rating)}</div>
                        <span class="quick-view__reviews">${product.reviews} reviews</span>
                    </div>

                    <div class="quick-view__price">
                        <span class="quick-view__price-current">${Helpers.formatPrice(price)}</span>
                        ${hasDiscount ? `
                            <span class="quick-view__price-original">${Helpers.formatPrice(product.price)}</span>
                            <span class="quick-view__price-discount">Save ${product.discount}%</span>
                        ` : ''}
                    </div>

                    <p class="quick-view__description">${product.description}</p>

                    <div class="quick-view__divider"></div>

                    ${product.colors && product.colors.length > 0 ? `
                        <div class="quick-view__option">
                            <span class="quick-view__option-label">Color</span>
                            <div class="quick-view__colors">
                                ${product.colors.map((color, index) => `
                                    <button class="quick-view__color ${index === 0 ? 'active' : ''}"
                                            style="background-color: ${this.getColorHex(color)};"
                                            data-color="${color}"
                                            title="${color}">
                                        <i class="fas fa-check"></i>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${product.sizes && product.sizes.length > 0 ? `
                        <div class="quick-view__option">
                            <span class="quick-view__option-label">Size</span>
                            <div class="quick-view__sizes">
                                ${product.sizes.map((size, index) => `
                                    <button class="quick-view__size ${index === 0 ? 'active' : ''}"
                                            data-size="${size}">
                                        ${size}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="quick-view__option">
                        <span class="quick-view__option-label">Quantity</span>
                        <div class="quick-view__quantity">
                            <button class="quick-view__qty-btn" onclick="QuickView.decreaseQuantity()">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" id="quickViewQuantity" value="1" min="1" max="${product.stock}" readonly>
                            <button class="quick-view__qty-btn" onclick="QuickView.increaseQuantity()">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <div class="quick-view__actions">
                        <button class="quick-view__add-cart" onclick="QuickView.addToCart()">
                            <i class="fas fa-shopping-bag"></i>
                            <span>Add to Cart</span>
                        </button>
                        <button class="quick-view__wishlist ${isInWishlist ? 'active' : ''}"
                                onclick="QuickView.toggleWishlist()"
                                id="quickViewWishlistBtn">
                            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>

                    <div class="quick-view__meta">
                        <div class="quick-view__meta-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}</span>
                        </div>
                        <div class="quick-view__meta-item">
                            <i class="fas fa-truck"></i>
                            <span>Free shipping over $50</span>
                        </div>
                        <div class="quick-view__meta-item">
                            <i class="fas fa-undo"></i>
                            <span>30-day returns</span>
                        </div>
                    </div>

                    <a href="product-detail.html?id=${product.id}" class="quick-view__details-link">
                        View Full Details <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;

        // Setup option buttons
        this.setupOptionButtons();
    },

    // Get color hex value
    getColorHex(colorName) {
        const colors = {
            'white': '#ffffff',
            'black': '#000000',
            'gray': '#808080',
            'blue': '#4a90d9',
            'navy': '#1a365d',
            'red': '#dc3545',
            'green': '#28a745',
            'brown': '#8b4513',
            'tan': '#d2b48c',
            'beige': '#f5f5dc',
            'cream': '#fffdd0',
            'natural': '#e8dcc4',
            'terracotta': '#e2725b',
            'sage': '#9dc183',
            'pink': '#ffc0cb',
            'blush': '#de5d83',
            'mustard': '#ffdb58',
            'gold': '#ffd700',
            'silver': '#c0c0c0',
            'turquoise': '#40e0d0',
            'multicolor': 'linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
            'walnut': '#5d432c',
            'maple': '#c9a66b',
            'bamboo': '#e3d59a',
            'amber': '#ffbf00'
        };
        return colors[colorName.toLowerCase()] || colorName;
    },

    // Setup option buttons (color, size)
    setupOptionButtons() {
        // Color buttons
        document.querySelectorAll('.quick-view__color').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.quick-view__color').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Size buttons
        document.querySelectorAll('.quick-view__size').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.quick-view__size').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
    },

    // Change main image
    changeImage(imageSrc, thumbnail) {
        const mainImage = document.getElementById('quickViewMainImage');
        if (mainImage) {
            mainImage.src = imageSrc;
        }

        // Update active thumbnail
        document.querySelectorAll('.quick-view__thumb').forEach(t => t.classList.remove('active'));
        thumbnail.classList.add('active');
    },

    // Increase quantity
    increaseQuantity() {
        const input = document.getElementById('quickViewQuantity');
        if (input) {
            const max = parseInt(input.max);
            const current = parseInt(input.value);
            if (current < max) {
                input.value = current + 1;
            }
        }
    },

    // Decrease quantity
    decreaseQuantity() {
        const input = document.getElementById('quickViewQuantity');
        if (input) {
            const min = parseInt(input.min);
            const current = parseInt(input.value);
            if (current > min) {
                input.value = current - 1;
            }
        }
    },

    // Add to cart
    addToCart() {
        if (!this.currentProduct) return;

        const quantityInput = document.getElementById('quickViewQuantity');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        const options = {};

        // Get selected color
        const activeColor = document.querySelector('.quick-view__color.active');
        if (activeColor) {
            options.color = activeColor.dataset.color;
        }

        // Get selected size
        const activeSize = document.querySelector('.quick-view__size.active');
        if (activeSize) {
            options.size = activeSize.dataset.size;
        }

        Cart.addItem(this.currentProduct.id, quantity, options);
        this.close();
    },

    // Toggle wishlist
    toggleWishlist() {
        if (!this.currentProduct) return;

        Wishlist.toggleItem(this.currentProduct.id);

        // Update button state
        const btn = document.getElementById('quickViewWishlistBtn');
        if (btn) {
            const isInWishlist = Wishlist.hasItem(this.currentProduct.id);
            btn.classList.toggle('active', isInWishlist);

            const icon = btn.querySelector('i');
            if (icon) {
                if (isInWishlist) {
                    icon.classList.replace('far', 'fas');
                } else {
                    icon.classList.replace('fas', 'far');
                }
            }
        }
    },

    // Show modal
    show() {
        const modal = document.getElementById('quickViewModal');
        const backdrop = document.getElementById('quickViewBackdrop');

        if (modal) {
            modal.classList.add('active');
        }
        if (backdrop) {
            backdrop.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    },

    // Close modal
    close() {
        const modal = document.getElementById('quickViewModal');
        const backdrop = document.getElementById('quickViewBackdrop');

        if (modal) {
            modal.classList.remove('active');
        }
        if (backdrop) {
            backdrop.classList.remove('active');
        }
        document.body.style.overflow = '';
        this.currentProduct = null;
    }
};

// Make QuickView available globally
if (typeof window !== 'undefined') {
    window.QuickView = QuickView;
}
