# 📋 Complete Postman Collection Setup Guide

## 🚀 Available Backend Routes

### Base URL
```
http://localhost:3001/api
```

---

## 🔐 Authentication Routes

### 1. Register User
- **Method**: `POST`
- **URL**: `{{baseUrl}}/auth/register`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: Returns user data and JWT token

### 2. Login User
- **Method**: `POST`
- **URL**: `{{baseUrl}}/auth/login`
- **Headers**: 
  ```
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "email": "admin@example.com",
    "password": "password"
  }
  ```
- **Response**: Returns user data and JWT token

### 3. Validate Token
- **Method**: `GET`
- **URL**: `{{baseUrl}}/auth/validate`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  ```
- **Response**: Returns user data if token is valid

### 4. Get User Profile
- **Method**: `GET`
- **URL**: `{{baseUrl}}/auth/profile`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  ```
- **Response**: Returns detailed user profile

### 5. Update User Profile
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/auth/profile`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com"
  }
  ```

### 6. Change Password
- **Method**: `PUT`
- **URL**: `{{baseUrl}}/auth/change-password`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```

---

## 💰 Transaction Routes

### 7. Get Transactions (with filters)
- **Method**: `GET`
- **URL**: `{{baseUrl}}/transactions`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  ```
- **Query Parameters**:
  ```
  page=1
  limit=10
  search=user_001
  status=paid
  category=revenue
  dateRange=30days
  ```
- **Full URL Example**: 
  ```
  {{baseUrl}}/transactions?page=1&limit=20&status=paid&category=revenue&dateRange=30days
  ```

### 8. Export Transactions
- **Method**: `POST`
- **URL**: `{{baseUrl}}/transactions/export`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  Content-Type: application/json
  ```
- **Body** (JSON):
  ```json
  {
    "columns": ["name", "email", "date", "amount", "status", "category"],
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-12-31"
    },
    "filters": {
      "status": "all",
      "category": "all",
      "dateRange": "all"
    },
    "format": "csv"
  }
  ```

---

## 📊 Dashboard Routes

### 9. Get Dashboard Data
- **Method**: `GET`
- **URL**: `{{baseUrl}}/dashboard`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  ```
- **Response**: Returns metrics, chart data, and recent transactions

---

## 📈 Analytics Routes

### 10. Get Analytics Data
- **Method**: `GET`
- **URL**: `{{baseUrl}}/analytics`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  ```
- **Query Parameters**:
  ```
  period=6months
  startDate=2024-01-01
  endDate=2024-12-31
  ```
- **Full URL Examples**:
  ```
  {{baseUrl}}/analytics?period=3months
  {{baseUrl}}/analytics?period=1year
  {{baseUrl}}/analytics?startDate=2024-01-01&endDate=2024-06-30
  ```

### 11. Get Analytics Summary
- **Method**: `GET`
- **URL**: `{{baseUrl}}/analytics/summary`
- **Headers**: 
  ```
  Authorization: Bearer {{authToken}}
  ```
- **Query Parameters**:
  ```
  period=1year
  ```
- **Full URL Example**: 
  ```
  {{baseUrl}}/analytics/summary?period=6months
  ```

---

## 🏥 Health Check Route

### 12. Health Check
- **Method**: `GET`
- **URL**: `{{baseUrl}}/health`
- **Headers**: None required
- **Response**: Server status and database connection info

---

## 🛠️ How to Create Postman Collection

### Step 1: Create New Collection
1. Open Postman
2. Click "New" → "Collection"
3. Name it "Finance App API"
4. Add description: "Complete API collection for Finance Dashboard Application"

### Step 2: Set Up Environment Variables
1. Click "Environments" → "Create Environment"
2. Name it "Finance App Local"
3. Add variables:
   ```
   baseUrl: http://localhost:3001/api
   authToken: (leave empty initially)
   ```

### Step 3: Create Folders
Create these folders in your collection:
- 🔐 Authentication
- 💰 Transactions  
- 📊 Dashboard
- 📈 Analytics
- 🏥 Health

### Step 4: Add Requests to Each Folder

#### Authentication Folder:
- Add all auth routes (1-6)
- For login request, add this **Test Script**:
  ```javascript
  if (pm.response.code === 200) {
      const response = pm.response.json();
      if (response.success && response.data.token) {
          pm.environment.set("authToken", response.data.token);
          console.log("Token saved:", response.data.token);
      }
  }
  ```

#### Transactions Folder:
- Add transaction routes (7-8)

#### Dashboard Folder:
- Add dashboard route (9)

#### Analytics Folder:
- Add analytics routes (10-11)

#### Health Folder:
- Add health check route (12)

### Step 5: Set Up Pre-request Scripts (Optional)
For authenticated routes, add this **Pre-request Script**:
```javascript
if (!pm.environment.get("authToken")) {
    console.log("No auth token found. Please login first.");
}
```

### Step 6: Test the Collection
1. Start your server: `npm run dev` (from server directory)
2. Run the Health Check request first
3. Run Login request to get auth token
4. Test other authenticated endpoints

---

## 📝 Sample Test Data

### Demo Login Credentials:
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

### Sample Registration Data:
```json
{
  "name": "Test User",
  "email": "test@example.com", 
  "password": "testpass123"
}
```

---

## 🔍 Expected Response Formats

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "pagination": { /* if applicable */ }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🚨 Important Notes

1. **Authentication Required**: All routes except `/health`, `/auth/login`, and `/auth/register` require Bearer token
2. **Token Management**: Login response includes token that should be saved to environment
3. **Data Validation**: Server validates all input data and returns appropriate error messages
4. **CORS**: Server is configured to accept requests from `localhost:5173` and `localhost:3000`
5. **Rate Limiting**: No rate limiting currently implemented
6. **Database**: Uses MongoDB with real transaction data

---

## 🔧 Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check if auth token is set and valid
2. **404 Not Found**: Verify the URL and route exists
3. **500 Internal Server Error**: Check server logs and database connection
4. **CORS Error**: Ensure server is running and CORS is properly configured

### Debug Tips:
- Check server console for detailed error logs
- Verify MongoDB connection in server startup logs
- Use Postman Console to see request/response details
- Test Health endpoint first to ensure server is running

---

## 📊 Analytics Data Explanation

The analytics endpoints return comprehensive financial data including:
- **Monthly Trends**: Revenue vs expenses over time
- **Category Breakdown**: Transaction distribution by category
- **User Activity**: Top users by transaction volume
- **Amount Distribution**: Transaction ranges and frequencies
- **Time Series**: Daily financial trends
- **Performance Metrics**: Profit margins and efficiency rates

This data powers all the charts and visualizations in the frontend Analytics dashboard.