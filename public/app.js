// CloudCart Application
const app = {
    apiBaseUrl: window.location.origin,
    products: [],
    environment: 'local',

    // Initialize app
    async init() {
        console.log('🚀 CloudCart initializing...');
        await this.loadEnvironment();
        await this.loadProducts();
        this.setupEventListeners();
    },

    // Load environment info
    async loadEnvironment() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/info`);
            const data = await response.json();
            this.environment = data.environment || 'local';
            this.updateEnvironmentBadge();
        } catch (error) {
            console.warn('Could not load environment info:', error);
        }
    },

    // Update environment badge
    updateEnvironmentBadge() {
        const badge = document.getElementById('environmentBadge');
        const footerEnv = document.getElementById('footerEnv');
        
        badge.textContent = this.environment.toUpperCase();
        badge.className = `environment-badge ${this.environment}`;
        footerEnv.textContent = this.environment;
    },

    // Load products from API
    async loadProducts() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const productsGrid = document.getElementById('productsGrid');

        try {
            loadingState.style.display = 'block';
            errorState.style.display = 'none';

            const response = await fetch(`${this.apiBaseUrl}/api/products`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.products = data.data;
            
            loadingState.style.display = 'none';
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            loadingState.style.display = 'none';
            errorState.style.display = 'block';
            document.getElementById('errorMessage').textContent = 
                'Failed to load products. Please try again.';
        }
    },

    // Render products to the grid
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        
        if (this.products.length === 0) {
            productsGrid.innerHTML = '<p style="color: white; text-align: center;">No products available</p>';
            return;
        }

        productsGrid.innerHTML = this.products.map(product => `
            <div class="product-card">
                <h3>${this.escapeHtml(product.name)}</h3>
                <p class="product-category">${this.escapeHtml(product.category)}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <p class="product-stock">
                    Stock: <span class="${product.stock < 20 ? 'low-stock' : ''}">${product.stock}</span>
                </p>
                <div class="product-actions">
                    <button class="btn btn-danger" onclick="app.deleteProduct(${product.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Toggle add product form
    toggleForm() {
        const form = document.getElementById('addProductForm');
        const btn = document.getElementById('toggleFormBtn');
        
        if (form.style.display === 'none') {
            form.style.display = 'block';
            btn.textContent = '✖️ Cancel';
        } else {
            form.style.display = 'none';
            btn.textContent = '➕ Add New Product';
            form.reset();
        }
    },

    // Add new product
    async addProduct(event) {
        event.preventDefault();
        
        const name = document.getElementById('productName').value;
        const price = document.getElementById('productPrice').value;
        const stock = document.getElementById('productStock').value;
        const category = document.getElementById('productCategory').value || 'Uncategorized';

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
            alert('✅ Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('❌ Failed to add product. Please try again.');
        }
    },

    // Delete product
    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) {
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
            alert('✅ Product deleted successfully!');
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('❌ Failed to delete product. Please try again.');
        }
    },

    // Setup event listeners
    setupEventListeners() {
        const form = document.getElementById('addProductForm');
        form.addEventListener('submit', (e) => this.addProduct(e));
    },

    // Utility: Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}