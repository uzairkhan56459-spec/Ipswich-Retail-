// ========================================
// SEARCH FUNCTIONALITY
// ========================================

const Search = {
    isOpen: false,
    searchResults: [],
    debounceTimer: null,

    // Initialize search
    init() {
        this.createSearchModal();
        this.setupEventListeners();
    },

    // Create search modal HTML
    createSearchModal() {
        const modalHTML = `
            <div class="search-modal" id="searchModal">
                <div class="search-modal__backdrop" id="searchBackdrop"></div>
                <div class="search-modal__container">
                    <div class="search-modal__header">
                        <div class="search-modal__input-wrapper">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="searchInput" 
                                   placeholder="Search for products..." 
                                   autocomplete="off">
                            <button class="search-modal__clear" id="searchClear" style="display: none;">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <button class="search-modal__close" id="searchClose" aria-label="Close search">
                            <span class="close-icon">
                                <span></span>
                                <span></span>
                            </span>
                        </button>
                    </div>
                    <div class="search-modal__content">
                        <div class="search-modal__quick" id="searchQuick">
                            <h4>Popular Searches</h4>
                            <div class="search-modal__tags">
                                <button class="search-modal__tag" data-search="pottery">Pottery</button>
                                <button class="search-modal__tag" data-search="jewelry">Jewelry</button>
                                <button class="search-modal__tag" data-search="bag">Bags</button>
                                <button class="search-modal__tag" data-search="scarf">Scarves</button>
                                <button class="search-modal__tag" data-search="vase">Vases</button>
                                <button class="search-modal__tag" data-search="earrings">Earrings</button>
                            </div>
                        </div>
                        <div class="search-modal__results" id="searchResults" style="display: none;">
                            <div class="search-modal__results-header">
                                <span id="searchResultsCount">0 results</span>
                            </div>
                            <div class="search-modal__results-grid" id="searchResultsGrid">
                                <!-- Results will be inserted here -->
                            </div>
                        </div>
                        <div class="search-modal__empty" id="searchEmpty" style="display: none;">
                            <i class="fas fa-search"></i>
                            <p>No products found</p>
                            <span>Try different keywords or browse our categories</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // Setup event listeners
    setupEventListeners() {
        // Search button click
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.open());
        }

        // Close button
        const closeBtn = document.getElementById('searchClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Backdrop click
        const backdrop = document.getElementById('searchBackdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.close());
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Clear button
        const clearBtn = document.getElementById('searchClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                document.getElementById('searchInput').value = '';
                this.handleSearch('');
                document.getElementById('searchInput').focus();
            });
        }

        // Quick search tags
        document.querySelectorAll('.search-modal__tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const searchTerm = tag.dataset.search;
                document.getElementById('searchInput').value = searchTerm;
                this.handleSearch(searchTerm);
            });
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Keyboard shortcut to open (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.isOpen) {
                    this.close();
                } else {
                    this.open();
                }
            }
        });
    },

    // Open search modal
    open() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.isOpen = true;
            
            // Focus input after animation
            setTimeout(() => {
                document.getElementById('searchInput').focus();
            }, 100);
        }
    },

    // Close search modal
    close() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.isOpen = false;
            
            // Clear search
            document.getElementById('searchInput').value = '';
            this.resetView();
        }
    },

    // Handle search input
    handleSearch(query) {
        const clearBtn = document.getElementById('searchClear');
        
        // Show/hide clear button
        if (clearBtn) {
            clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
        }

        // Debounce search
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    },

    // Perform the actual search
    async performSearch(query) {
        const quickSection = document.getElementById('searchQuick');
        const resultsSection = document.getElementById('searchResults');
        const emptySection = document.getElementById('searchEmpty');

        if (!query.trim()) {
            this.resetView();
            return;
        }

        // Ensure products are loaded
        let products = ProductGrid.products || [];
        if (products.length === 0) {
            await ProductGrid.loadProducts();
            products = ProductGrid.products || [];
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        this.searchResults = products.filter(product => {
            return (
                product.name.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        });

        // Update UI
        quickSection.style.display = 'none';

        if (this.searchResults.length > 0) {
            resultsSection.style.display = 'block';
            emptySection.style.display = 'none';
            this.renderResults();
        } else {
            resultsSection.style.display = 'none';
            emptySection.style.display = 'flex';
        }
    },

    // Reset to default view
    resetView() {
        document.getElementById('searchQuick').style.display = 'block';
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('searchEmpty').style.display = 'none';
    },

    // Render search results
    renderResults() {
        const resultsGrid = document.getElementById('searchResultsGrid');
        const resultsCount = document.getElementById('searchResultsCount');

        if (resultsCount) {
            resultsCount.textContent = `${this.searchResults.length} result${this.searchResults.length !== 1 ? 's' : ''} found`;
        }

        if (resultsGrid) {
            resultsGrid.innerHTML = this.searchResults.map(product => this.createResultCard(product)).join('');
        }
    },

    // Create result card HTML
    createResultCard(product) {
        const price = product.salePrice || product.price;
        const hasDiscount = product.salePrice && product.salePrice < product.price;

        return `
            <a href="product-detail.html?id=${product.id}" class="search-result-card" onclick="Search.close()">
                <div class="search-result-card__image">
                    <img src="${product.images.main}" alt="${product.name}">
                    ${hasDiscount ? `<span class="search-result-card__badge">-${product.discount}%</span>` : ''}
                </div>
                <div class="search-result-card__info">
                    <span class="search-result-card__category">${product.category}</span>
                    <h4 class="search-result-card__title">${product.name}</h4>
                    <div class="search-result-card__price">
                        <span class="current">${Helpers.formatPrice(price)}</span>
                        ${hasDiscount ? `<span class="original">${Helpers.formatPrice(product.price)}</span>` : ''}
                    </div>
                    <div class="search-result-card__rating">
                        ${Helpers.generateStars(product.rating)}
                        <span>(${product.reviews})</span>
                    </div>
                </div>
            </a>
        `;
    }
};

// Make Search available globally
if (typeof window !== 'undefined') {
    window.Search = Search;
}
