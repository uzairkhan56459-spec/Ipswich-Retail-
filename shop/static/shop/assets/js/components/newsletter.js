// ========================================
// NEWSLETTER SUBSCRIPTION
// ========================================

const Newsletter = {
    // Initialize newsletter
    init() {
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        const forms = document.querySelectorAll('#newsletterForm, .newsletter-form, .footer__newsletter form');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit(form);
            });
        });
    },

    // Handle form submission
    handleSubmit(form) {
        const emailInput = form.querySelector('input[type="email"]');

        if (!emailInput) return;

        const email = emailInput.value.trim();

        // Validate email
        if (!Helpers.isValidEmail(email)) {
            Helpers.showToast('Please enter a valid email address', 'error');
            return;
        }

        // Check if already subscribed
        const subscribers = Storage.get('newsletter_subscribers') || [];
        if (subscribers.includes(email)) {
            Helpers.showToast('You are already subscribed!', 'error');
            return;
        }

        // Add to subscribers
        subscribers.push(email);
        Storage.set('newsletter_subscribers', subscribers);

        // Show success message
        Helpers.showToast('Successfully subscribed to newsletter!', 'success');

        // Reset form
        form.reset();
    }
};

// Make Newsletter available globally
if (typeof window !== 'undefined') {
    window.Newsletter = Newsletter;
}
