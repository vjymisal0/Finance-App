# Finance App API Documentation 📚

A comprehensive guide to the Finance App REST API endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Auth Endpoints](#-auth-endpoints)
  - [Dashboard Endpoints](#-dashboard-endpoints)
  - [Transaction Endpoints](#-transaction-endpoints)
  - [Analytics Endpoints](#-analytics-endpoints)
  - [Health Check](#-health-check)
- [Response Format](#response-format)
- [Error Codes](#error-codes)
- [Usage Examples](#usage-examples)

---

## Overview

### Base URL
```
http://localhost:3001/api
```

### Content Type
All requests should include:
```
Content-Type: application/json
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header. You can obtain a token by logging in through the `/auth/login` endpoint.

**Authentication Header Format:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API Endpoints

### 🔐 Auth Endpoints

#### Register User
**`POST /auth/register`**

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

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` – Validation errors
- `409 Conflict` – Email already exists

---

#### Login User
**`POST /auth/login`**

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` – Missing credentials
- `401 Unauthorized` – Invalid credentials

---

#### Validate Token
**`GET /auth/validate`** 🔒

Validate JWT token and return user information.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` – Invalid or expired token

---

#### Get User Profile
**`GET /auth/profile`** 🔒

Get current user's profile information.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

#### Update User Profile
**`PUT /auth/profile`** 🔒

Update user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "email": "newemail@example.com",
      "firstName": "John",
      "lastName": "Smith"
    }
  }
}
```

---

#### Change Password
**`PUT /auth/change-password`** 🔒

Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request` – Invalid current password
- `422 Unprocessable Entity` – Password validation failed

---

### 📊 Dashboard Endpoints

#### Get Dashboard Data
**`GET /dashboard`** 🔒

Get comprehensive dashboard data including summary statistics and recent transactions.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalBalance": 15000.50,
    "totalIncome": 25000.00,
    "totalExpenses": 10000.50,
    "transactionCount": 150,
    "recentTransactions": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "description": "Grocery Shopping",
        "amount": -125.50,
        "category": "Food",
        "type": "expense",
        "date": "2024-01-15T00:00:00.000Z"
      }
    ],
    "monthlyData": [
      {
        "month": "January",
        "income": 5000,
        "expenses": 3000
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Food",
        "amount": 1200,
        "percentage": 25.5
      }
    ]
  }
}
```

---

### 💰 Transaction Endpoints

#### Get Transactions
**`GET /transactions`** 🔒

Get user's transactions with filtering and pagination.

**Query Parameters:**
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Number of items per page (default: 10, max: 100)
- `category` (string, optional): Filter by category
- `type` (string, optional): Filter by type (`income` or `expense`)
- `startDate` (string, optional): Start date for filtering (ISO format)
- `endDate` (string, optional): End date for filtering (ISO format)
- `search` (string, optional): Search in description

**Example Request:**
```
GET /transactions?page=1&limit=20&category=Food&type=expense&startDate=2024-01-01&endDate=2024-12-31
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "description": "Grocery Shopping",
        "amount": -125.50,
        "category": "Food",
        "type": "expense",
        "date": "2024-01-15T00:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

#### Create Transaction
**`POST /transactions`** 🔒

Create a new transaction.

**Request Body:**
```json
{
  "description": "Salary Payment",
  "amount": 5000.00,
  "category": "Salary",
  "type": "income",
  "date": "2024-01-15T00:00:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "description": "Salary Payment",
      "amount": 5000.00,
      "category": "Salary",
      "type": "income",
      "date": "2024-01-15T00:00:00.000Z",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

#### Update Transaction
**`PUT /transactions/:id`** 🔒

Update an existing transaction.

**Request Body:**
```json
{
  "description": "Updated Description",
  "amount": 150.00,
  "category": "Updated Category",
  "type": "expense",
  "date": "2024-01-16T00:00:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "transaction": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "description": "Updated Description",
      "amount": 150.00,
      "category": "Updated Category",
      "type": "expense",
      "date": "2024-01-16T00:00:00.000Z",
      "updatedAt": "2024-01-16T10:30:00.000Z"
    }
  }
}
```

---

#### Delete Transaction
**`DELETE /transactions/:id`** 🔒

Delete a transaction.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` – Transaction not found
- `403 Forbidden` – Not authorized to delete this transaction

---

#### Export Transactions
**`POST /transactions/export`** 🔒

Export transactions as CSV or Excel file.

**Request Body:**
```json
{
  "format": "csv",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "categories": ["Food", "Transportation"],
  "type": "expense"
}
```

**Parameters:**
- `format` (string): Export format (`csv` or `excel`)
- `startDate` (string, optional): Start date for export
- `endDate` (string, optional): End date for export
- `categories` (array, optional): Filter by categories
- `type` (string, optional): Filter by type (`income` or `expense`)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Export completed successfully",
  "data": {
    "downloadUrl": "/api/transactions/download/export-file-id",
    "filename": "transactions-2024.csv",
    "recordCount": 150
  }
}
```

---

### 📈 Analytics Endpoints

#### Get Analytics
**`GET /analytics`** 🔒

Get comprehensive analytics data including trends and breakdowns.

**Query Parameters:**
- `period` (string, optional): Time period (`month`, `quarter`, `year`) (default: `month`)
- `startDate` (string, optional): Start date for analysis
- `endDate` (string, optional): End date for analysis

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 150,
      "totalIncome": 25000.00,
      "totalExpenses": 10000.50,
      "netIncome": 14999.50,
      "averageTransaction": 125.50,
      "savingsRate": 59.99
    },
    "monthlyTrends": [
      {
        "month": "2024-01",
        "income": 5000.00,
        "expenses": 3000.00,
        "net": 2000.00
      }
    ],
    "categoryBreakdown": [
      {
        "category": "Food",
        "amount": 1200.00,
        "percentage": 25.5,
        "transactionCount": 24
      }
    ],
    "topExpenseCategories": [
      {
        "category": "Food",
        "amount": 1200.00,
        "percentage": 25.5
      }
    ],
    "dailySpending": [
      {
        "date": "2024-01-15",
        "amount": 125.50
      }
    ]
  }
}
```

---

#### Get Analytics Summary
**`GET /analytics/summary`** 🔒

Get a quick analytics overview.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 150,
    "averageTransaction": 125.50,
    "topSpendingCategory": {
      "category": "Food",
      "amount": 1200.00
    },
    "savingsRate": 59.99,
    "monthlyGrowth": 12.5,
    "budgetUtilization": 75.2
  }
}
```

---

### 🏥 Health Check

#### Server Health
**`GET /health`**

Check server health status.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "database": "Connected",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `BAD_REQUEST` | Invalid request data |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Access denied |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `VALIDATION_ERROR` | Data validation failed |
| 429 | `RATE_LIMIT` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## Usage Examples

### Authentication Flow
```bash
# 1. Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# 3. Use token for authenticated requests
curl -X GET http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Transaction Management
```bash
# Create a transaction
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "description": "Grocery Shopping",
    "amount": -125.50,
    "category": "Food",
    "type": "expense",
    "date": "2024-01-15T00:00:00.000Z"
  }'

# Get filtered transactions
curl -X GET "http://localhost:3001/api/transactions?category=Food&type=expense&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Analytics
```bash
# Get comprehensive analytics
curl -X GET http://localhost:3001/api/analytics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get analytics summary
curl -X GET http://localhost:3001/api/analytics/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

**🔒 Note:** Endpoints marked with 🔒 require JWT authentication in the Authorization header.

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **Export endpoints**: 3 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```
