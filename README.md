# CloudCart - Azure DevOps Learning Project

A full-stack e-commerce application built to learn Azure DevOps, CI/CD pipelines, and Azure infrastructure.

## Architecture

- **Backend**: Node.js/Express REST API
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Infrastructure**: 2 Azure App Services (Free tier)
- **CI/CD**: Azure Pipelines with GitHub integration

## Project Structure
```
cloudcart/
├── api/
│   └── server.js           # Express server (API + static file serving)
├── public/                 # Frontend static files
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── package.json
├── web.config              # Azure App Service configuration
├── azure-pipelines.yml     # CI/CD pipeline
└── README.md
```

## Local Development
```bash
npm install
npm start
# App runs on http://localhost:8080
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/health` - Health check
- `GET /api/info` - API information

## Branching Strategy

- `main` → Production environment
- `develop` → Development environment
- `feature/*` → Feature branches

## Azure Resources

- **Resource Group**: rg-cloudcart-learning
- **DEV Environment**: cloudcart-dev-XXXXX
- **PROD Environment**: cloudcart-prod-XXXXX