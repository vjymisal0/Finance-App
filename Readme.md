# Finance App 💰

A modern, full-stack financial dashboard application built with React and Node.js. Track your transactions, visualize spending patterns, and manage your finances with an intuitive interface.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Setup Guide](#setup-guide)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- 🔐 **Secure Authentication** - JWT-based user authentication
- 📊 **Transaction Management** - Track income and expenses
- 📈 **Interactive Dashboard** - Real-time analytics and insights
- 📱 **Responsive Design** - Works on all devices
- 📤 **Data Export** - Export transactions to CSV/Excel
- 🎨 **Modern UI** - Built with Tailwind CSS

---

## Tech Stack

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts  
**Backend:** Node.js + Express + MongoDB + JWT  
**Tools:** ESLint + PostCSS + VS Code Extensions

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/vjymisal0/Finance-App.git
cd Finance-App

# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup environment
echo "MONGODB_URI=mongodb://localhost:27017/finance-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
PORT=3001
NODE_ENV=development
DB_NAME=finance-app" > server/.env

# Start development servers
cd client
npm run dev
```

**Access the app:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/api/health

---

## Setup Guide

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or yarn
- **MongoDB** (local or Atlas)
- **Git**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/vjymisal0/Finance-App.git
cd Finance-App
```

2. **Install dependencies:**
```bash
# Server dependencies
cd server && npm install

# Client dependencies  
cd ../client && npm install
```

### Environment Configuration

Create a `.env` file in the **server** directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/finance-app
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Server
PORT=3001
NODE_ENV=development
DB_NAME=finance-app
```

### Database Setup

**Option 1: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Database will be created automatically

**Option 2: MongoDB Atlas**
- Create MongoDB Atlas account
- Create new cluster
- Get connection string
- Update `MONGODB_URI` in `.env`

---

## Running the Application

### Development Mode

```bash
# Start both client and server
cd client
npm run dev
```

This command starts both the frontend (http://localhost:5173) and backend (http://localhost:3001) servers.

### Production Mode

```bash
# Build for production
cd client
npm run build

# Preview production build
npm run preview
```

### Individual Services

```bash
# Start only backend
cd server
npm start

# Start only frontend (in new terminal)
cd client  
npm run dev
```

---

## Project Structure

```
Finance-App/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── services/       # API communication
│   │   └── types/          # TypeScript definitions
│   └── package.json
├── server/                 # Express backend  
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   └── config/            # Configuration files
└── README.md
```

---

## Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Postman Collection](https://www.postman.com/sadasd-4116/workspace/looperai-assignment-by-vijay-misal/collection/36927067-2e9bc4c7-ee24-42f7-ba21-aa3e93338cb7)** - Test API endpoints
- **[GitHub Gist](https://gist.github.com/vjymisal0/32ad84db560ffd2c4a07783358ba9b93)** - Additional resources

---


## Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation when needed
- Ensure all tests pass before submitting

### Bug Reports
- Use GitHub issues to report bugs
- Include steps to reproduce the issue
- Mention your environment details

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support & Resources

**Getting Help:**
- 📖 [API Documentation](./API_DOCUMENTATION.md)
- 🔗 [Postman Collection](https://www.postman.com/sadasd-4116/workspace/looperai-assignment-by-vijay-misal/collection/36927067-2e9bc4c7-ee24-42f7-ba21-aa3e93338cb7)
- � [GitHub Issues](https://github.com/vjymisal0/Finance-App/issues)
- 📚 [Additional Resources](https://gist.github.com/vjymisal0/32ad84db560ffd2c4a07783358ba9b93)

**Useful Links:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/api/health

---

**Happy coding! 💻✨**