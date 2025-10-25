// CloudCart Landing Page Application
const app = {
    apiBaseUrl: window.location.origin,
    environment: 'local',

    // Initialize application
    async init() {
        console.log('🚀 CloudCart Landing Page initializing...');
        await this.loadEnvironment();
        await this.loadProductCount();
        this.setupNavigation();
        this.setupSmoothScroll();
    },

    // Load environment information
    async loadEnvironment() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/info`);
            const data = await response.json();
            this.environment = data.environment || 'local';
            this.updateEnvironmentBadge();
            console.log(`📍 Environment: ${this.environment}`);
        } catch (error) {
            console.warn('Could not load environment info:', error);
            this.updateEnvironmentBadge();
        }
    },

    // Update environment badge
    updateEnvironmentBadge() {
        const badge = document.getElementById('environmentBadge');
        const footerEnv = document.getElementById('footerEnv');
        
        if (badge) {
            badge.textContent = this.environment.toUpperCase();
            badge.className = `environment-badge ${this.environment}`;
        }
        
        if (footerEnv) {
            footerEnv.textContent = this.environment;
            footerEnv.className = `env-text ${this.environment}`;
        }
    },

    // Load product count for stats
    async loadProductCount() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/products`);
            const data = await response.json();
            
            const countElement = document.getElementById('productCount');
            if (countElement && data.success) {
                this.animateCounter(countElement, data.count);
            }
        } catch (error) {
            console.warn('Could not load product count:', error);
            const countElement = document.getElementById('productCount');
            if (countElement) {
                countElement.textContent = '5+';
            }
        }
    },

    // Animate counter
    animateCounter(element, target) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 30);
    },

    // Setup mobile navigation
    setupNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });

            // Close menu when clicking a link
            const links = navLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                }
            });
        }
    },

    // Setup smooth scrolling for anchor links
    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}