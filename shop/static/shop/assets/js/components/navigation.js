// ========================================
// NAVIGATION
// ========================================

const Navigation = {
    // Initialize navigation
    init() {
        this.setupMobileMenu();
        this.setupStickyHeader();
        this.setActiveLink();
    },

    // Setup mobile menu
    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenuClose = document.getElementById('mobileMenuClose');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        // Open mobile menu
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.openMobileMenu();
            });
        }

        // Close mobile menu
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Close on overlay click
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Close on link click
        if (mobileMenu) {
            const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__nav-link');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
        }

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    },

    // Open mobile menu
    openMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        if (mobileMenu) {
            mobileMenu.classList.add('active');
        }
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('active');
        }
        document.body.style.overflow = 'hidden';
    },

    // Close mobile menu
    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');

        if (mobileMenu) {
            mobileMenu.classList.remove('active');
        }
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
    },

    // Setup sticky header
    setupStickyHeader() {
        const header = document.querySelector('.header');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll
            if (currentScroll > 0) {
                header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            }

            lastScroll = currentScroll;
        });
    },

    // Set active navigation link based on current page
    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        // Desktop navigation
        const navLinks = document.querySelectorAll('.header__nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Mobile navigation
        const mobileNavLinks = document.querySelectorAll('.mobile-menu__nav-link');
        mobileNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.style.color = '#d4a373';
                link.style.fontWeight = '600';
            }
        });
    }
};

// Make Navigation available globally
if (typeof window !== 'undefined') {
    window.Navigation = Navigation;
}
