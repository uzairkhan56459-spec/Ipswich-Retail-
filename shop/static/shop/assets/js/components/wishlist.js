// ========================================
// WISHLIST
// ========================================

const Wishlist = {
    items: [],

    // Initialize wishlist
    init() {
        this.loadWishlist();
        this.setupEventListeners();
        this.updateWishlistUI();
    },

    // Load wishlist from localStorage
    loadWishlist() {
        this.items = Storage.get('wishlist') || [];
    },

    // Save wishlist to localStorage
    saveWishlist() {
        Storage.set('wishlist', this.items);
        this.updateWishlistUI();
    },

    // Add item to wishlist
    addItem(productId) {
        if (this.items.includes(productId)) {
            Helpers.showToast('Item already in wishlist', 'error');
            return;
        }

        this.items.push(productId);
        this.saveWishlist();
        Helpers.showToast('Added to wishlist!', 'success');
    },

    // Remove item from wishlist
    removeItem(productId) {
        const index = this.items.indexOf(productId);
        if (index > -1) {
            this.items.splice(index, 1);
            this.saveWishlist();
            Helpers.showToast('Removed from wishlist', 'success');
        }
    },

    // Toggle item in wishlist
    toggleItem(productId) {
        if (this.items.includes(productId)) {
            this.removeItem(productId);
        } else {
            this.addItem(productId);
        }
    },

    // Check if item is in wishlist
    hasItem(productId) {
        return this.items.includes(productId);
    },

    // Get wishlist item count
    getItemCount() {
        return this.items.length;
    },

    // Clear wishlist
    clearWishlist() {
        this.items = [];
        this.saveWishlist();
    },

    // Update wishlist UI
    updateWishlistUI() {
        // Update wishlist count badge
        const wishlistCountEl = document.getElementById('wishlistCount');
        if (wishlistCountEl) {
            const count = this.getItemCount();
            wishlistCountEl.textContent = count;
            wishlistCountEl.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update wishlist button states on product cards
        this.updateWishlistButtons();
    },

    // Update wishlist button states
    updateWishlistButtons() {
        document.querySelectorAll('[data-wishlist-btn]').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            if (this.hasItem(productId)) {
                btn.classList.add('active');
                btn.querySelector('i').classList.replace('far', 'fas');
            } else {
                btn.classList.remove('active');
                btn.querySelector('i').classList.replace('fas', 'far');
            }
        });
    },

    // Setup event listeners
    setupEventListeners() {
        // Wishlist button in header
        const wishlistBtn = document.getElementById('wishlistBtn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                // Navigate to wishlist page (you can create this page)
                window.location.href = 'wishlist.html';
            });
        }

        // Delegate event for wishlist buttons on product cards
        document.addEventListener('click', (e) => {
            const wishlistBtn = e.target.closest('[data-wishlist-btn]');
            if (wishlistBtn) {
                const productId = parseInt(wishlistBtn.dataset.productId);
                this.toggleItem(productId);
            }
        });
    }
};

// Make Wishlist available globally
if (typeof window !== 'undefined') {
    window.Wishlist = Wishlist;
}
