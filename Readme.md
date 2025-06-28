# 💰 Finance Dashboard Application

A comprehensive, full-stack financial management dashboard built with React, Node.js, Express, and MongoDB. This application provides real-time analytics, transaction management, and interactive data visualizations for personal and business financial tracking.

## 🌟 Features

### 🔐 **Authentication & Security**
- JWT-based authentication system
- Secure user registration and login
- Password hashing with bcrypt
- Protected routes and middleware
- Demo account for testing

### 📊 **Dashboard & Analytics**
- Real-time financial metrics and KPIs
- Interactive charts and visualizations
- Monthly trends analysis
- Category-wise expense breakdown
- Revenue vs expense tracking
- Performance metrics and insights

### 💳 **Transaction Management**
- Complete transaction CRUD operations
- Advanced filtering and search capabilities
- Pagination for large datasets
- Export functionality (CSV/Excel)
- Real-time transaction status updates
- Category-based organization

### 📈 **Advanced Analytics**
- Multiple chart types (Line, Bar, Pie, Scatter, Area)
- Time-series data analysis
- Performance metrics tracking
- User activity insights
- Amount distribution analysis
- Profit margin calculations

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Dark theme with modern aesthetics
- Smooth animations and transitions
- Interactive components
- Alert system for user feedback
- Professional dashboard layout

---

## 🚀 Live Demo & Resources

### 🌐 **Deployed Application**
- **Frontend**: [Live Demo Link - Coming Soon](#)
- **Backend API**: [API Endpoint - Coming Soon](#)

### 📋 **Documentation & Collections**
- **Postman Collection**: [Import Collection Link - Coming Soon](#)
- **API Documentation**: [Detailed API Docs - Coming Soon](#)
- **Code Repository**: [GitHub Gist Link - Coming Soon](#)

### 🔗 **Quick Links**
- **Demo Credentials**: `admin@example.com` / `password`
- **Health Check**: `GET /api/health`
- **API Base URL**: `http://localhost:3001/api`

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **Chart.js** - Advanced charting
- **Lucide React** - Icon library
- **Axios** - HTTP client

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin support

### **Development Tools**
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **Nodemon** - Auto-restart server
- **Concurrently** - Run multiple scripts

---

## 📦 Installation & Setup

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn package manager

### **1. Clone Repository**
```bash
git clone https://github.com/vjymisal0/Finance-App.git
cd Finance-App
```

### **2. Backend Setup**
```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Name
DB_NAME=financeappcluster
```

### **3. Frontend Setup**
```bash
cd ../client
npm install
```

### **4. Start Development Servers**

**Option 1: Start both servers simultaneously**
```bash
cd client
npm run dev
```

**Option 2: Start servers separately**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run client
```

### **5. Access Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🔌 API Documentation

### **Base URL**
```
http://localhost:3001/api
```

### **Authentication Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/validate` | Validate JWT token | ✅ |
| GET | `/auth/profile` | Get user profile | ✅ |
| PUT | `/auth/profile` | Update profile | ✅ |
| PUT | `/auth/change-password` | Change password | ✅ |

### **Transaction Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/transactions` | Get transactions with filters | ✅ |
| POST | `/transactions/export` | Export transactions | ✅ |

### **Dashboard Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | Get dashboard data | ✅ |

### **Analytics Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics` | Get analytics data | ✅ |
| GET | `/analytics/summary` | Get analytics summary | ✅ |

### **Utility Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | ❌ |

---

## 📊 Sample API Requests

### **Login Request**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

### **Get Transactions**
```bash
curl -X GET "http://localhost:3001/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Analytics Data**
```bash
curl -X GET "http://localhost:3001/api/analytics?period=6months" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 Testing

### **Demo Account**
Use these credentials to test the application:
- **Email**: `admin@example.com`
- **Password**: `password`

### **Postman Collection**
1. Import the Postman collection using the link above
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3001/api`
   - `authToken`: (leave empty - auto-populated)
3. Run the login request first to get authentication token
4. Test other endpoints with automatic token authentication

### **Health Check**
Verify server is running:
```bash
curl http://localhost:3001/api/health
```

- **Description:** Retrieve a list of items.
- **Response:**
    - `200 OK` – Returns an array of items.

#### `GET /items/:id`

- **Description:** Retrieve a single item by ID.
- **Parameters:**
    - `id` (string, required): Item ID.
- **Response:**
    - `200 OK` – Returns the item object.
    - `404 Not Found` – Item does not exist.

#### `POST /items`

- **Description:** Create a new item.
- **Body:**
    - `name` (string, required)
    - `description` (string, optional)
- **Response:**
    - `201 Created` – Returns the created item.

#### `PUT /items/:id`

- **Description:** Update an existing item.
- **Parameters:**
    - `id` (string, required)
- **Body:**
    - `name` (string, optional)
    - `description` (string, optional)
- **Response:**
    - `200 OK` – Returns the updated item.

#### `DELETE /items/:id`

- **Description:** Delete an item by ID.
- **Parameters:**
    - `id` (string, required)
- **Response:**
    - `204 No Content`

---


## 🚀 Live Demo & Resources

### 🌐 **Deployed Application**
- **Frontend**: [Live Demo Link - Coming Soon](#)
- **Backend API**: [API Endpoint - Coming Soon](#)

### 📋 **Documentation & Collections**
- **Postman Collection**: [Import Collection Link - Coming Soon](#)
- **API Documentation**: [Detailed API Docs - Coming Soon](#)
- **Code Repository**: [GitHub Gist Link - Coming Soon](#)

### 🔗 **Quick Links**
- **Demo Credentials**: `admin@example.com` / `password`
- **Health Check**: `GET /api/health`
- **API Base URL**: `http://localhost:3001/api`

---

## 📈 Roadmap

### **Upcoming Features**
- [ ] Real-time notifications
- [ ] Advanced reporting system
- [ ] Multi-currency support
- [ ] Mobile application
- [ ] Integration with banking APIs
- [ ] Advanced security features
- [ ] Team collaboration tools
- [ ] Custom dashboard widgets

### **Performance Improvements**
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Bundle size optimization
- [ ] Progressive Web App features

---

## 📞 Support

If you encounter any issues or have questions:

1. **Check the troubleshooting section above**
2. **Review the API documentation**
3. **Create an issue on GitHub**
4. **Contact the development team**

---

**⭐ If you find this project helpful, please give it a star on GitHub!**