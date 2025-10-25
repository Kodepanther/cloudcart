// CloudCart Products Page Application
const productApp = {
    apiBaseUrl: window.location.origin,
    products: [],
    environment: 'local',
    searchTerm: '',

    // Initialize application
    async init() {
        console.log('🚀 CloudCart Products Page initializing...');
        await this.loadEnvironment();
        await this.loadProducts();
        this.setupEventListeners();
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
        }
    },

    // Load products from API
    async loadProducts() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const productsGrid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        try {
            loadingState.style.display = 'block';
            errorState.style.display = 'none';
            productsGrid.style.display = 'none';
            emptyState.style.display = 'none';

            const response = await fetch(`${this.apiBaseUrl}/api/products`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.products = data.data || [];
            
            loadingState.style.display = 'none';
            
            if (this.products.length === 0) {
                emptyState.style.display = 'block';
            } else {
                productsGrid.style.display = 'grid';
                this.renderProducts();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            loadingState.style.display = 'none';
            errorState.style.display = 'block';
            document.getElementById('errorMessage').textContent = 
                'Failed to load products. Please check your connection and try again.';
        }
    },

    // Render products to the grid
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        
        let filteredProducts = this.products;
        
        // Apply search filter
        if (this.searchTerm) {
            filteredProducts = this.products.filter(product => 
                product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                    <p style="font-size: 1.2rem; color: #666;">No products match your search</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filteredProducts.map(product => {
            const stockStatus = this.getStockStatus(product.stock);
            return `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-header">
                        <h3>${this.escapeHtml(product.name)}</h3>
                        <span class="product-category">${this.escapeHtml(product.category)}</span>
                    </div>
                    <div class="product-details">
                        <div class="product-price">$${product.price.toFixed(2)}</div>
                        <div class="product-stock">
                            <span>Stock:</span>
                            <span class="stock-badge ${stockStatus.class}">
                                ${product.stock} ${stockStatus.label}
                            </span>
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-danger btn-icon" onclick="productApp.deleteProduct(${product.id})">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // Get stock status
    getStockStatus(stock) {
        if (stock === 0) {
            return { class: 'out-of-stock', label: 'Out of Stock' };
        } else if (stock < 20) {
            return { class: 'low-stock', label: 'Low Stock' };
        } else {
            return { class: 'in-stock', label: 'In Stock' };
        }
    },

    // Toggle add product form
    toggleForm() {
        const form = document.getElementById('addProductForm');
        const btn = document.getElementById('toggleFormBtn');
        
        if (form.style.display === 'none') {
            form.style.display = 'block';
            btn.textContent = '✖️ Cancel';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            // Scroll to form
            form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            form.style.display = 'none';
            btn.textContent = '➕ Add New Product';
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
            document.getElementById('productForm').reset();
        }
    },

    // Add new product
    async addProduct(event) {
        event.preventDefault();
        
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const category = document.getElementById('productCategory').value.trim();

        // Validation
        if (!name || !category) {
            alert('❌ Please fill in all required fields');
            return;
        }

        if (price < 0 || stock < 0) {
            alert('❌ Price and stock must be positive numbers');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, price, stock, category })
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            await this.loadProducts();
            this.toggleForm();
            this.showNotification('✅ Product added successfully!', 'success');
        } catch (error) {
            console.error('Error adding product:', error);
            this.showNotification('❌ Failed to add product. Please try again.', 'error');
        }
    },

    // Delete product
    async deleteProduct(id) {
        const product = this.products.find(p=> p.id === id);
        if (!product) return;

        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            await this.loadProducts();
            this.showNotification('✅ Product deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('❌ Failed to delete product. Please try again.', 'error');
        }
    },

    // Show notification
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    // Setup event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderProducts();
            });
        }

        // Mobile navigation
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
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

    // Utility: Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => productApp.init());
} else {
    productApp.init();
}
