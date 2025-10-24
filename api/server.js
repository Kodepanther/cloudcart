const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '../public')));

// In-memory database
let products = [
    { id: 1, name: 'Gaming Laptop', price: 1299.99, stock: 10, category: 'Electronics' },
    { id: 2, name: 'Wireless Mouse', price: 29.99, stock: 50, category: 'Accessories' },
    { id: 3, name: 'Mechanical Keyboard', price: 89.99, stock: 30, category: 'Accessories' },
    { id: 4, name: 'USB-C Hub', price: 49.99, stock: 25, category: 'Accessories' },
    { id: 5, name: '4K Monitor', price: 399.99, stock: 15, category: 'Electronics' }
];

// API Routes
app.get('/api/info', (req, res) => {
    res.json({ 
        message: 'CloudCart API',
        version: '1.0.0',
        environment: process.env.ENVIRONMENT || 'local',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.ENVIRONMENT || 'local'
    });
});

app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        count: products.length,
        data: products
    });
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
        return res.status(404).json({ 
            success: false, 
            error: 'Product not found' 
        });
    }
    res.json({
        success: true,
        data: product
    });
});

app.post('/api/products', (req, res) => {
    const { name, price, stock, category } = req.body;
    
    if (!name || !price || !stock) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: name, price, stock' 
        });
    }

    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category: category || 'Uncategorized'
    };
    
    products.push(newProduct);
    res.status(201).json({
        success: true,
        data: newProduct
    });
});

app.put('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
        return res.status(404).json({ 
            success: false, 
            error: 'Product not found' 
        });
    }

    const { name, price, stock, category } = req.body;
    
    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (category) product.category = category;

    res.json({
        success: true,
        data: product
    });
});

app.delete('/api/products/:id', (req, res) => {
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));
    
    if (productIndex === -1) {
        return res.status(404).json({ 
            success: false, 
            error: 'Product not found' 
        });
    }
    
    products.splice(productIndex, 1);
    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});

// Catch all - serve index.html for any non-API routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`🚀 CloudCart running on port ${port}`);
    console.log(`📍 Environment: ${process.env.ENVIRONMENT || 'local'}`);
    console.log(`🌐 Frontend: http://localhost:${port}`);
    console.log(`📡 API: http://localhost:${port}/api`);
});