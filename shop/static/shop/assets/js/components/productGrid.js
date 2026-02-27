// ========================================
// PRODUCT GRID
// ========================================

const ProductGrid = {
    products: [],
    filteredProducts: [],

    // Initialize product grid
    async init(containerId = 'productGrid', limit = 8) {
        console.log('ProductGrid.init called for:', containerId);
        await this.loadProducts();
        console.log('Products loaded:', this.products.length);
        this.filteredProducts = this.products.slice(0, limit);
        console.log('Filtered products:', this.filteredProducts.length);
        this.render(containerId);
    },

    // Load products from JSON
    async loadProducts() {
        try {
            // Use helper to get correct path for GitHub Pages
            const basePath = Helpers.getBasePath();
            const paths = [
                `${basePath}/assets/data/products.json`,
                '../assets/data/products.json',
                './assets/data/products.json',
                'assets/data/products.json'
            ];
            
            let data = null;
            
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        console.log('Products loaded from:', path);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (data && data.products) {
                this.products = data.products;
                return this.products;
            }
            
            console.error('Could not load products from any path');
            return [];
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    },

    // Create product card HTML
    createProductCard(product) {
        const price = product.salePrice || product.price;
        const hasDiscount = product.salePrice && product.salePrice < product.price;
        const isInWishlist = Wishlist.hasItem(product.id);
        const placeholderImg = 'https://via.placeholder.com/500x500?text=Image+Not+Available';

        return `
            <div class="product-card">
                ${product.badge ? `
                    <span class="product-card__badge product-card__badge--${product.badge}">
                        ${product.badge === 'sale' ? `-${product.discount}%` : product.badge}
                    </span>
                ` : ''}

                <div class="product-card__image-wrapper">
                    <img src="${product.images.main}" alt="${product.name}" class="product-card__image-main" onerror="this.onerror=null; this.src='${placeholderImg}';">
                    <img src="${product.images.hover}" alt="${product.name}" class="product-card__image-hover" onerror="this.onerror=null; this.src='${placeholderImg}';">

                    <div class="product-card__actions">
                        <button class="product-card__action-btn ${isInWishlist ? 'active' : ''}"
                                data-wishlist-btn
                                data-product-id="${product.id}"
                                title="Add to Wishlist">
                            <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="product-card__action-btn"
                                onclick="QuickView.open(${product.id})"
                                title="Quick View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="product-card__action-btn"
                                title="Compare">
                            <i class="fas fa-exchange-alt"></i>
                        </button>
                    </div>
                </div>

                <div class="product-card__content">
                    <div class="product-card__category">${product.category}</div>
                    <a href="product-detail.html?id=${product.id}" class="product-card__title">
                        ${product.name}
                    </a>

                    <div class="product-card__rating">
                        <span class="stars">${Helpers.generateStars(product.rating)}</span>
                        <span class="count">(${product.reviews})</span>
                    </div>

                    <div class="product-card__price">
                        <span class="current">${Helpers.formatPrice(price)}</span>
                        ${hasDiscount ? `
                            <span class="original">${Helpers.formatPrice(product.price)}</span>
                        ` : ''}
                    </div>

                    <button class="btn btn-primary btn-sm product-card__cart-btn"
                            onclick="Cart.addItem(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    },

    // Render products to container
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-box-open fa-3x mb-3" style="color: #ccc;"></i>
                    <p style="color: #999;">No products found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProducts
            .map(product => this.createProductCard(product))
            .join('');

        // Update wishlist button states
        Wishlist.updateWishlistButtons();
    },

    // Filter products by category
    filterByCategory(category, containerId = 'productGrid') {
        if (category === 'all') {
            this.filteredProducts = this.products;
        } else {
            this.filteredProducts = this.products.filter(p => p.category === category);
        }
        this.render(containerId);
    },

    // Filter products with advanced filters
    filterProducts(filters, containerId = 'productGrid') {
        this.filteredProducts = Helpers.filterProducts(this.products, filters);
        this.render(containerId);
    },

    // Sort products
    sortProducts(sortBy, containerId = 'productGrid') {
        this.filteredProducts = Helpers.sortProducts(this.filteredProducts, sortBy);
        this.render(containerId);
    },

    // Get product by ID
    getProductById(id) {
        return this.products.find(p => p.id === parseInt(id));
    }
};

// Make ProductGrid available globally
if (typeof window !== 'undefined') {
    window.ProductGrid = ProductGrid;
}
