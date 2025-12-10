// src/services/authService.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { AppError } = require('../utils/errorHandler');

class AuthService {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>}
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        user: user.getProfile(),
        token,
      };
    } catch (error) {
      throw new AppError(`Registration failed: ${error.message}`, 400);
    }
  }

  /**
   * Login user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        user: user.getProfile(),
        token,
      };
    } catch (error) {
      throw new AppError(`Login failed: ${error.message}`, 401);
    }
  }

  /**
   * Generate JWT token
   * @param {String} userId - User ID
   * @returns {String}
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, config.jwtSecret, {
      expiresIn: config.jwtExpire,
    });
  }

  /**
   * Verify JWT token
   * @param {String} token - JWT token
   * @returns {Object}
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }

  /**
   * Get user profile
   * @param {String} userId - User ID
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user.getProfile();
    } catch (error) {
      throw new AppError(`Failed to get profile: ${error.message}`, 400);
    }
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updateData) {
    try {
      // Remove sensitive fields
      delete updateData.password;
      delete updateData.email;
      delete updateData.role;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user.getProfile();
    } catch (error) {
      throw new AppError(`Failed to update profile: ${error.message}`, 400);
    }
  }
}

module.exports = new AuthService();