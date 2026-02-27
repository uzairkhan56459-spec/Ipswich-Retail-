// ========================================
// HELPER FUNCTIONS
// ========================================

const Helpers = {
    // Get base path for GitHub Pages compatibility
    getBasePath() {
        const path = window.location.pathname;
        // Check if we're on GitHub Pages (path contains repo name)
        if (path.includes('/H-G---Handmade-Goods-eCommerce-Website')) {
            return '/H-G---Handmade-Goods-eCommerce-Website';
        }
        return '';
    },

    // Get data path for fetching JSON files
    getDataPath(filename) {
        return `${this.getBasePath()}/assets/data/${filename}`;
    },

    // Format price to currency
    formatPrice(price) {
        return `$${parseFloat(price).toFixed(2)}`;
    },

    // Calculate discount price
    calculateDiscount(price, discountPercent) {
        return price - (price * discountPercent / 100);
    },

    // Generate star rating HTML
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHTML = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }

        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }

        return starsHTML;
    },

    // Truncate text
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast(message, type = 'success') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.innerHTML = `
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 16px 24px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                }
                .toast-success { border-left: 4px solid #28a745; }
                .toast-error { border-left: 4px solid #dc3545; }
                .toast-success i { color: #28a745; }
                .toast-error i { color: #dc3545; }
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(400px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Add to DOM
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Get URL parameters
    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Sort products
    sortProducts(products, sortBy) {
        const sorted = [...products];

        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => {
                    const priceA = a.salePrice || a.price;
                    const priceB = b.salePrice || b.price;
                    return priceA - priceB;
                });

            case 'price-high':
                return sorted.sort((a, b) => {
                    const priceA = a.salePrice || a.price;
                    const priceB = b.salePrice || b.price;
                    return priceB - priceA;
                });

            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));

            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));

            case 'rating':
                return sorted.sort((a, b) => b.rating - a.rating);

            case 'newest':
                return sorted.sort((a, b) => b.id - a.id);

            default:
                return sorted;
        }
    },

    // Filter products
    filterProducts(products, filters) {
        let filtered = [...products];

        // Filter by category
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(p => p.category === filters.category);
        }

        // Filter by price range
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            filtered = filtered.filter(p => {
                const price = p.salePrice || p.price;
                const min = filters.minPrice || 0;
                const max = filters.maxPrice || Infinity;
                return price >= min && price <= max;
            });
        }

        // Filter by search query
        if (filters.search) {
            const query = filters.search.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return filtered;
    },

    // Validate email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Format date
    formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    },

    // Smooth scroll to element
    scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Helpers = Helpers;
}
