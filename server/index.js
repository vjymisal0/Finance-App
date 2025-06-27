import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db(process.env.DB_NAME || 'financeappcluster');
    console.log('✅ Connected to MongoDB Atlas');
    
    // Create indexes for better performance and data integrity
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('data').createIndex({ date: -1 });
      await db.collection('data').createIndex({ user_id: 1 });
      console.log('✅ Database indexes created successfully');
    } catch (indexError) {
      console.log('ℹ️ Indexes may already exist:', indexError.message);
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Auth middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(decoded.id),
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Helper function to generate avatar URL
const generateAvatarUrl = (name) => {
  const avatars = [
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150'
  ];
  
  // Use name hash to consistently assign same avatar to same name
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return avatars[Math.abs(hash) % avatars.length];
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: db ? 'Connected' : 'Disconnected'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      avatar: generateAvatarUrl(name),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      lastLogin: null,
      emailVerified: false
    };

    const result = await usersCollection.insertOne(newUser);
    
    if (!result.insertedId) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const userResponse = {
      id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    };

    console.log(`✅ New user registered: ${newUser.email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the platform.',
      data: {
        user: userResponse,
        token: token
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const usersCollection = db.collection('users');
    
    // Handle demo login
    if (email === 'admin@example.com' && password === 'password') {
      // Create or get demo admin user
      let demoUser = await usersCollection.findOne({ email: 'admin@example.com' });
      
      if (!demoUser) {
        const hashedPassword = await bcrypt.hash('password', 12);
        const demoUserData = {
          name: 'Demo Admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'admin',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          lastLogin: new Date(),
          emailVerified: true
        };
        
        const result = await usersCollection.insertOne(demoUserData);
        demoUser = { ...demoUserData, _id: result.insertedId };
      }
      
      // Update last login
      await usersCollection.updateOne(
        { _id: demoUser._id },
        { 
          $set: { 
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        }
      );

      const token = jwt.sign(
        { 
          id: demoUser._id.toString(),
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Demo login successful',
        data: {
          user: {
            id: demoUser._id.toString(),
            name: demoUser.name,
            email: demoUser.email,
            role: demoUser.role,
            avatar: demoUser.avatar
          },
          token: token
        }
      });
    }
    
    // Find user by email
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    console.log(`✅ User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token: token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

app.get('/api/auth/validate', authenticateToken, async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    
    // Find user by ID from token
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(req.user.id) 
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Return user data (without password)
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    res.json({
      success: true,
      message: 'Token valid',
      data: userResponse
    });

  } catch (error) {
    console.error('❌ Token validation error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    const usersCollection = db.collection('users');

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if email is already taken by another user
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: new ObjectId(req.user.id) }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already taken by another user'
      });
    }

    // Update user
    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          updatedAt: new Date()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user data
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const usersCollection = db.collection('users');

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }
    );

    console.log(`✅ Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Transaction routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      type = 'all',
      category = 'all',
      dateRange = 'all'
    } = req.query;

    const collection = db.collection('data');
    
    // Build query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { user_id: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = { $regex: new RegExp(status, 'i') };
    }

    // Category filter
    if (category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }
      
      if (startDate) {
        query.date = { $gte: startDate.toISOString() };
      }
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get paginated results
    const transactions = await collection
      .find(query)
      .sort({ date: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    // Transform data to match frontend expectations
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction._id.toString(),
      name: transaction.user_id || 'Unknown User',
      email: `${transaction.user_id}@example.com`,
      date: transaction.date,
      amount: transaction.amount,
      status: transaction.status || 'Completed',
      type: transaction.category === 'Revenue' ? 'Income' : 'Expense',
      category: transaction.category,
      avatar: transaction.user_profile || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      userId: transaction.user_id,
      description: `${transaction.category} transaction`
    }));

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: transformedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

// Dashboard data route
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const collection = db.collection('data');
    
    // Get all transactions for calculations
    const allTransactions = await collection.find({}).toArray();
    
    // Calculate metrics
    const totalIncome = allTransactions
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = allTransactions
      .filter(t => t.category !== 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savings = balance * 0.2; // Assume 20% savings rate

    // Mock metrics with real calculations
    const metrics = [
      {
        title: 'Balance',
        amount: balance,
        icon: 'Wallet',
        change: 12.5,
        changeType: 'increase'
      },
      {
        title: 'Revenue',
        amount: totalIncome,
        icon: 'TrendingUp',
        change: 8.2,
        changeType: 'increase'
      },
      {
        title: 'Expenses',
        amount: totalExpenses,
        icon: 'CreditCard',
        change: -3.1,
        changeType: 'decrease'
      },
      {
        title: 'Savings',
        amount: savings,
        icon: 'PiggyBank',
        change: 15.7,
        changeType: 'increase'
      }
    ];

    // Generate chart data (mock for now, you can enhance this)
    const chartData = [
      { month: 'Jan', income: 4000, expenses: 2400 },
      { month: 'Feb', income: 3000, expenses: 1398 },
      { month: 'Mar', income: 2000, expenses: 9800 },
      { month: 'Apr', income: 2780, expenses: 3908 },
      { month: 'May', income: 1890, expenses: 4800 },
      { month: 'Jun', income: 2390, expenses: 3800 },
      { month: 'Jul', income: 3490, expenses: 4300 },
      { month: 'Aug', income: 4000, expenses: 2400 },
      { month: 'Sep', income: 3000, expenses: 1398 },
      { month: 'Oct', income: 2000, expenses: 9800 },
      { month: 'Nov', income: 2780, expenses: 3908 },
      { month: 'Dec', income: 1890, expenses: 4800 }
    ];

    // Get recent transactions
    const recentTransactions = await collection
      .find({})
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    const transformedRecentTransactions = recentTransactions.map(transaction => ({
      id: transaction._id.toString(),
      name: transaction.user_id || 'Unknown User',
      email: `${transaction.user_id}@example.com`,
      date: transaction.date,
      amount: transaction.category === 'Revenue' ? transaction.amount : -transaction.amount,
      status: transaction.status || 'Completed',
      type: transaction.category === 'Revenue' ? 'Income' : 'Expense',
      category: transaction.category,
      avatar: transaction.user_profile || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
    }));

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        metrics,
        chartData,
        recentTransactions: transformedRecentTransactions
      }
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Export transactions route
app.post('/api/transactions/export', authenticateToken, async (req, res) => {
  try {
    const { columns, dateRange, filters, format } = req.body;
    
    const collection = db.collection('data');
    
    // Build query based on filters
    let query = {};
    
    if (filters.status !== 'all') {
      query.status = { $regex: new RegExp(filters.status, 'i') };
    }
    
    if (filters.category !== 'all') {
      query.category = { $regex: new RegExp(filters.category, 'i') };
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      query.date = {
        $gte: dateRange.start,
        $lte: dateRange.end
      };
    }

    const transactions = await collection.find(query).toArray();
    
    // Transform data for export
    const exportData = transactions.map(transaction => ({
      name: transaction.user_id || 'Unknown User',
      email: `${transaction.user_id}@example.com`,
      date: transaction.date,
      amount: transaction.amount,
      status: transaction.status || 'Completed',
      type: transaction.category === 'Revenue' ? 'Income' : 'Expense',
      category: transaction.category,
      description: `${transaction.category} transaction`
    }));

    // Create CSV content
    const headers = columns;
    const csvContent = [
      headers.join(','),
      ...exportData.map(transaction => 
        columns.map(column => {
          const value = transaction[column];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csvContent);

  } catch (error) {
    console.error('❌ Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  try {
    await client.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/api/health`);
    console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : 'Missing'}`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});