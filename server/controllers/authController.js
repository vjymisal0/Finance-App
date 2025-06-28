import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { User } from '../models/User.js';
import { validateEmail, validatePassword } from '../utils/helpers.js';

export const register = async (req, res) => {
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

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password and create user
    const hashedPassword = await User.hashPassword(password);
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    const result = await newUser.save();
    
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
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Handle demo login
    if (email === 'admin@example.com' && password === 'password') {
      const demoUser = await User.createDemoUser();
      
      // Update last login
      await User.updateById(demoUser._id, { lastLogin: new Date() });

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
    const user = await User.findByEmail(email);

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
    const isPasswordValid = await User.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await User.updateById(user._id, { lastLogin: new Date() });

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
};

export const validateToken = async (req, res) => {
  try {
    // Find user by ID from token
    const user = await User.findById(req.user.id);

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
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

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
    const existingUser = await User.findByEmail(email);

    if (existingUser && existingUser._id.toString() !== req.user.id) {
      return res.status(409).json({
        success: false,
        message: 'Email is already taken by another user'
      });
    }

    // Update user
    const updateResult = await User.updateById(req.user.id, {
      name: name.trim(),
      email: email.toLowerCase().trim()
    });

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get updated user data
    const updatedUser = await User.findById(req.user.id);

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
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

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
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await User.comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await User.hashPassword(newPassword);

    // Update password
    await User.updateById(req.user.id, { password: hashedNewPassword });

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
};