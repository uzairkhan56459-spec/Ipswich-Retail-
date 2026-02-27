// ========================================
// CATEGORY FILTERS & TABS
// ========================================

const Filters = {
    // Initialize filters
    init() {
        this.setupCategoryTabs();
    },

    // Setup category tabs
    setupCategoryTabs() {
        const tabs = document.querySelectorAll('.category-tabs__btn');

        tabs.forEach(tab => {
            tab.addEventListener('click', async (e) => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                tab.classList.add('active');

                // Get category from data attribute
                const category = tab.dataset.category;

                // Ensure products are loaded before filtering
                if (ProductGrid.products.length === 0) {
                    await ProductGrid.loadProducts();
                }

                // Filter products
                ProductGrid.filterByCategory(category);
            });
        });
    },

    // Setup shop page filters (for shop.html)
    setupShopFilters() {
        this.setupCategoryFilter();
        this.setupPriceFilter();
        this.setupSortingFilter();
        this.setupSearchFilter();
    },

    // Category filter
    setupCategoryFilter() {
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.applyShopFilters();
            });
        });
    },

    // Price range filter
    setupPriceFilter() {
        const priceRange = document.getElementById('priceRange');
        const minPriceDisplay = document.getElementById('minPrice');
        const maxPriceDisplay = document.getElementById('maxPrice');

        if (priceRange) {
            priceRange.addEventListener('input', (e) => {
                const maxPrice = e.target.value;
                if (maxPriceDisplay) {
                    maxPriceDisplay.textContent = Helpers.formatPrice(maxPrice);
                }
            });

            priceRange.addEventListener('change', () => {
                this.applyShopFilters();
            });
        }
    },

    // Sorting filter
    setupSortingFilter() {
        const sortSelect = document.getElementById('sortSelect');

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const sortBy = e.target.value;
                ProductGrid.sortProducts(sortBy, 'shopProductGrid');
            });
        }
    },

    // Search filter
    setupSearchFilter() {
        const searchInput = document.getElementById('productSearch');

        if (searchInput) {
            const debouncedSearch = Helpers.debounce(() => {
                this.applyShopFilters();
            }, 300);

            searchInput.addEventListener('input', debouncedSearch);
        }
    },

    // Apply all shop filters
    applyShopFilters() {
        const filters = {
            category: this.getSelectedCategories(),
            minPrice: this.getMinPrice(),
            maxPrice: this.getMaxPrice(),
            search: this.getSearchQuery()
        };

        ProductGrid.filterProducts(filters, 'shopProductGrid');
    },

    // Get selected categories
    getSelectedCategories() {
        const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked');
        const categories = Array.from(categoryCheckboxes).map(cb => cb.value);

        if (categories.length === 0 || categories.includes('all')) {
            return 'all';
        }

        return categories;
    },

    // Get min price
    getMinPrice() {
        const minPriceInput = document.getElementById('minPriceInput');
        return minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
    },

    // Get max price
    getMaxPrice() {
        const priceRange = document.getElementById('priceRange');
        return priceRange ? parseFloat(priceRange.value) || Infinity : Infinity;
    },

    // Get search query
    getSearchQuery() {
        const searchInput = document.getElementById('productSearch');
        return searchInput ? searchInput.value.trim() : '';
    }
};

// Make Filters available globally
if (typeof window !== 'undefined') {
    window.Filters = Filters;
}
