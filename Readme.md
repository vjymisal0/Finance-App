# Finance App 💰

A modern, full-stack financial dashboard application built with React and Node.js. Track your transactions, visualize spending patterns, and manage your finances with an intuitive interface.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Guide](#setup-guide)
- [Usage Examples](#usage-examples)
- [API Documentation](#api-documentation)
- [Live Demo & Resources](#-live-demo--resources)
- [Contributing](#contributing)
- [License](#license)

---

## Features

✨ **Core Features:**
- 🔐 User authentication (JWT-based)
- 📊 Transaction management and tracking
- 📈 Interactive dashboard with analytics
- 💹 Real-time financial insights
- 📱 Responsive design for all devices
- 📤 Data export functionality
- 🎨 Modern UI with Tailwind CSS

✨ **Technical Features:**
- RESTful API architecture
- MongoDB database integration
- React with TypeScript frontend
- Express.js backend
- JWT authentication
- Comprehensive error handling

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Recharts for data visualization
- Axios for API calls

**Backend:**
- Node.js with Express
- MongoDB for database
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

---

## Setup Guide

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/vjymisal0/Finance-App.git
cd Finance-App
```

2. **Install dependencies for both client and server:**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Or install both from root (if using root package.json)
cd ..
npm install
```

### Environment Variables

Create a `.env` file in the **server** directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/finance-app
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Name
DB_NAME=finance-app
```

### Database Setup

1. **For Local MongoDB:**
   - Install MongoDB locally
   - Start MongoDB service
   - The app will automatically create the database

2. **For MongoDB Atlas:**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get the connection string
   - Replace `MONGODB_URI` in `.env`

### Running the Application

**Development Mode:**

1. **Start the backend server:**
```bash
cd server
npm start
```

2. **Start the frontend client (in a new terminal):**
```bash
cd client
npm run dev
```

**Or start both simultaneously from client directory:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## Usage Examples

### 1. Starting the Application

```bash
# Development mode (both client and server)
cd client
npm run dev

# Production build
npm run build
npm run preview
```

### 2. User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 3. User Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 4. Get Dashboard Data (Authenticated)

```bash
curl -X GET http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Transactions (Authenticated)

```bash
curl -X GET http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Health Check

```bash
curl -X GET http://localhost:3001/api/health
```

---

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 🔐 **Authentication Endpoints**

#### `POST /auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
- `201 Created` – User registered successfully
- `400 Bad Request` – Validation errors
- `409 Conflict` – Email already exists

#### `POST /auth/login`
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### `GET /auth/validate` 🔒
Validate JWT token.

**Response:**
- `200 OK` – Token is valid
- `401 Unauthorized` – Invalid token

#### `GET /auth/profile` 🔒
Get user profile information.

#### `PUT /auth/profile` 🔒
Update user profile.

#### `PUT /auth/change-password` 🔒
Change user password.

---

### 📊 **Dashboard Endpoints**

#### `GET /dashboard` 🔒
Get comprehensive dashboard data including summary statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalBalance": 15000,
    "totalIncome": 25000,
    "totalExpenses": 10000,
    "recentTransactions": [...],
    "monthlyData": [...]
  }
}
```

---

### 💰 **Transaction Endpoints**

#### `GET /transactions` 🔒
Get user's transactions with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of items per page
- `category` (string): Filter by category
- `type` (string): Filter by type (income/expense)
- `startDate` (string): Start date for filtering
- `endDate` (string): End date for filtering

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

#### `POST /transactions/export` 🔒
Export transactions as CSV or Excel.

**Request Body:**
```json
{
  "format": "csv", // or "excel"
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

---

### 📈 **Analytics Endpoints**

#### `GET /analytics` 🔒
Get comprehensive analytics data.

**Response:**
```json
{
  "success": true,
  "data": {
    "monthlyTrends": [...],
    "categoryBreakdown": [...],
    "yearOverYear": [...],
    "topCategories": [...]
  }
}
```

#### `GET /analytics/summary` 🔒
Get analytics summary/overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 150,
    "averageTransaction": 125.50,
    "topSpendingCategory": "Food",
    "savingsRate": 25.5
  }
}
```

---

### 🏥 **Health Check**

#### `GET /health`
Check server health status.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "Connected"
}
```

---

### 📝 **Response Format**

All API responses follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### 🔒 Authentication Note
Endpoints marked with 🔒 require JWT authentication in the Authorization header.

---


---

## 🚀 Live Demo & Resources

### 🌐 **Deployed Application**
- **Frontend**: [Live Demo Link - Coming Soon](#)
- **Backend API**: [API Endpoint - Coming Soon](#)

### 📋 **Documentation & Collections**
- **Postman Collection**: [Import Collection Link - Coming Soon](https://www.postman.com/sadasd-4116/workspace/looperai-assignment-by-vijay-misal/collection/36927067-2e9bc4c7-ee24-42f7-ba21-aa3e93338cb7?action=share&source=copy-link&creator=36927067)
- **API Documentation**: [Detailed API Docs - Coming Soon](#)
- **Code Repository**: [GitHub Gist Resources](https://gist.github.com/vjymisal0/32ad84db560ffd2c4a07783358ba9b93) 

### 🔗 **Quick Links**
- **Demo Credentials**: Create your own account via `/auth/register`
- **Health Check**: `GET /api/health`
- **API Base URL**: `http://localhost:3001/api`

### 🛠️ **Development Tools**
- **Frontend Dev Server**: `http://localhost:5173`
- **Backend Dev Server**: `http://localhost:3001`
- **MongoDB Compass**: For database management
- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets, MongoDB for VS Code

---

## 🚀 **Getting Started Quickly**

1. **Clone and setup:**
```bash
git clone https://github.com/vjymisal0/Finance-App.git
cd Finance-App
cd server && npm install
cd ../client && npm install
```

2. **Configure environment:**
```bash
# Create .env in server directory
echo "MONGODB_URI=mongodb://localhost:27017/finance-app
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
DB_NAME=finance-app" > server/.env
```

3. **Start development:**
```bash
cd client
npm run dev
```

4. **Access the app:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

---

## 📱 **Application Structure**

```
Finance-App/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── config/            # Configuration files
└── README.md
```

---


## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create your feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes and commit:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### 📋 **Contribution Guidelines**
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### 🐛 **Bug Reports**
- Use the issue tracker to report bugs
- Include detailed steps to reproduce
- Mention your environment (OS, Node version, etc.)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for the amazing frontend framework
- Express.js for the robust backend framework
- MongoDB for the flexible database solution
- All contributors who help improve this project

---

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [documentation](https://gist.github.com/vjymisal0/32ad84db560ffd2c4a07783358ba9b93)
- Contact the maintainers

---

**Happy coding! 💻✨**