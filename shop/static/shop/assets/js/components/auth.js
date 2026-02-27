// ========================================
// AUTH MODAL (Login/Register)
// ========================================

const Auth = {
    modal: null,
    backdrop: null,
    currentTab: 'login',

    // Initialize auth modal
    init() {
        console.log('Auth module initializing...');
        this.modal = document.getElementById('authModal');
        this.backdrop = document.getElementById('authBackdrop');
        
        console.log('Auth modal found:', !!this.modal);
        console.log('Auth backdrop found:', !!this.backdrop);

        this.setupEventListeners();
        this.loadUserState();
    },

    // Setup event listeners
    setupEventListeners() {
        // Account button click
        const accountBtn = document.getElementById('accountBtn');
        console.log('Account button found:', !!accountBtn);
        
        if (accountBtn) {
            accountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Account button clicked!');
                
                const user = this.getCurrentUser();
                if (user) {
                    this.showUserMenu();
                } else {
                    this.openModal();
                }
            });
        }

        // Close button
        const closeBtn = document.getElementById('authModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Backdrop click
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.closeModal());
        }

        // Tab switching
        const tabBtns = document.querySelectorAll('.auth-modal__tab');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form submission
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Password visibility toggle
        const toggleBtns = document.querySelectorAll('.password-toggle');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.togglePasswordVisibility(btn));
        });

        // Link switches (switch between login/register)
        const switchLinks = document.querySelectorAll('[data-switch-tab]');
        switchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.dataset.switchTab);
            });
        });
    },

    // Open modal
    openModal(tab = 'login') {
        console.log('Opening auth modal...');
        
        if (!this.modal || !this.backdrop) {
            console.error('Auth modal or backdrop not found!');
            return;
        }
        
        this.switchTab(tab);
        this.modal.classList.add('active');
        this.backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus first input
        setTimeout(() => {
            const activePane = document.querySelector('.auth-modal__pane.active');
            const firstInput = activePane?.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 300);
    },

    // Close modal
    closeModal() {
        if (!this.modal || !this.backdrop) return;
        
        this.modal.classList.remove('active');
        this.backdrop.classList.remove('active');
        document.body.style.overflow = '';
        this.clearForms();
    },

    // Switch tabs
    switchTab(tab) {
        this.currentTab = tab;

        // Update tab buttons
        document.querySelectorAll('.auth-modal__tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update panes
        document.querySelectorAll('.auth-modal__pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tab}Pane`);
        });
    },

    // Toggle password visibility
    togglePasswordVisibility(btn) {
        const input = btn.previousElementSibling;
        const icon = btn.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    },

    // Handle login
    handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.querySelector('#loginEmail').value.trim();
        const password = form.querySelector('#loginPassword').value;
        const remember = form.querySelector('#rememberMe')?.checked;

        // Validate
        if (!this.validateEmail(email)) {
            this.showError('loginEmail', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError('loginPassword', 'Password must be at least 6 characters');
            return;
        }

        // Check if user exists
        const users = this.getUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            this.showError('loginEmail', 'No account found with this email');
            return;
        }

        if (user.password !== this.hashPassword(password)) {
            this.showError('loginPassword', 'Incorrect password');
            return;
        }

        // Login successful
        this.setCurrentUser(user, remember);
        this.closeModal();
        this.updateUI();
        Helpers.showToast(`Welcome back, ${user.name}!`, 'success');
    },

    // Handle registration
    handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const name = form.querySelector('#registerName').value.trim();
        const email = form.querySelector('#registerEmail').value.trim();
        const password = form.querySelector('#registerPassword').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;
        const agreeTerms = form.querySelector('#agreeTerms')?.checked;

        // Validate
        if (name.length < 2) {
            this.showError('registerName', 'Name must be at least 2 characters');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('registerEmail', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError('registerPassword', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            return;
        }

        if (!agreeTerms) {
            this.showError('agreeTerms', 'You must agree to the terms and conditions');
            return;
        }

        // Check if user already exists
        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            this.showError('registerEmail', 'An account with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        // Auto login
        this.setCurrentUser(newUser, true);
        this.closeModal();
        this.updateUI();
        Helpers.showToast(`Welcome, ${name}! Your account has been created.`, 'success');
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Simple hash for demo purposes (use proper hashing in production!)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    },

    // Show error
    showError(inputId, message) {
        const input = document.getElementById(inputId);
        if (!input) return;

        // Remove existing error
        this.clearError(inputId);

        // Add error class
        input.classList.add('error');

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-modal__error';
        errorDiv.textContent = message;

        // Insert after input group
        const inputGroup = input.closest('.auth-modal__input-group') || input.closest('.auth-modal__checkbox');
        if (inputGroup) {
            inputGroup.appendChild(errorDiv);
        }

        // Focus input
        input.focus();
    },

    // Clear error
    clearError(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.classList.remove('error');
        const inputGroup = input.closest('.auth-modal__input-group') || input.closest('.auth-modal__checkbox');
        const existingError = inputGroup?.querySelector('.auth-modal__error');
        if (existingError) existingError.remove();
    },

    // Clear all forms
    clearForms() {
        const forms = document.querySelectorAll('.auth-modal form');
        forms.forEach(form => {
            form.reset();
            form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            form.querySelectorAll('.auth-modal__error').forEach(el => el.remove());
        });
    },

    // Get users from storage
    getUsers() {
        return Storage.get('hg_users') || [];
    },

    // Save users to storage
    saveUsers(users) {
        Storage.set('hg_users', users);
    },

    // Get current user
    getCurrentUser() {
        const stored = Storage.get('hg_current_user');
        if (stored) return stored;
        const session = sessionStorage.getItem('hg_current_user');
        return session ? JSON.parse(session) : null;
    },

    // Set current user
    setCurrentUser(user, remember = false) {
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        if (remember) {
            Storage.set('hg_current_user', userData);
        } else {
            sessionStorage.setItem('hg_current_user', JSON.stringify(userData));
        }
    },

    // Load user state
    loadUserState() {
        this.updateUI();
    },

    // Update UI based on user state
    updateUI() {
        const user = this.getCurrentUser();
        const accountBtn = document.getElementById('accountBtn');
        
        if (accountBtn) {
            if (user) {
                // User is logged in - show initial or icon
                const initial = typeof user === 'object' ? user.name.charAt(0).toUpperCase() : user;
                accountBtn.innerHTML = `<span class="user-initial">${typeof user === 'object' ? user.name.charAt(0).toUpperCase() : 'U'}</span>`;
                accountBtn.classList.add('logged-in');
                accountBtn.title = `Logged in as ${typeof user === 'object' ? user.name : 'User'}`;
            } else {
                // User is not logged in
                accountBtn.innerHTML = '<i class="fas fa-user"></i>';
                accountBtn.classList.remove('logged-in');
                accountBtn.title = 'Login / Register';
            }
        }
    },

    // Show user menu (when logged in)
    showUserMenu() {
        const user = this.getCurrentUser();
        if (!user) return;

        // Check if menu already exists
        let userMenu = document.querySelector('.user-dropdown');
        if (userMenu) {
            userMenu.remove();
            return;
        }

        const userName = typeof user === 'object' ? user.name : 'User';
        const userEmail = typeof user === 'object' ? user.email : '';

        userMenu = document.createElement('div');
        userMenu.className = 'user-dropdown';
        userMenu.innerHTML = `
            <div class="user-dropdown__header">
                <div class="user-dropdown__avatar">${userName.charAt(0).toUpperCase()}</div>
                <div class="user-dropdown__info">
                    <span class="user-dropdown__name">${userName}</span>
                    <span class="user-dropdown__email">${userEmail}</span>
                </div>
            </div>
            <div class="user-dropdown__divider"></div>
            <a href="#" class="user-dropdown__item">
                <i class="fas fa-user"></i> My Profile
            </a>
            <a href="#" class="user-dropdown__item">
                <i class="fas fa-shopping-bag"></i> My Orders
            </a>
            <a href="#" class="user-dropdown__item">
                <i class="fas fa-heart"></i> Wishlist
            </a>
            <a href="#" class="user-dropdown__item">
                <i class="fas fa-cog"></i> Settings
            </a>
            <div class="user-dropdown__divider"></div>
            <button class="user-dropdown__item user-dropdown__logout" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;

        // Position the menu
        const accountBtn = document.getElementById('accountBtn');
        const btnRect = accountBtn.getBoundingClientRect();
        
        document.body.appendChild(userMenu);

        // Setup logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
            userMenu.remove();
        });

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!userMenu.contains(e.target) && e.target !== accountBtn) {
                    userMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    },

    // Logout
    logout() {
        Storage.removeItem('hg_current_user');
        sessionStorage.removeItem('hg_current_user');
        this.updateUI();
        Helpers.showToast('You have been logged out', 'info');
    }
};
