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
      // Accept either name or email as identifier
      const identifier = (userData.email || userData.name || '').trim();
      let email = null;
      let name = null;
      if (identifier.includes('@')) {
        email = identifier.toLowerCase();
        name = userData.name || email.split('@')[0];
      } else {
        name = identifier || `user${Date.now()}`;
        email = userData.email ? String(userData.email).toLowerCase() : null;
      }

      // Check existing user by email or name
      if (email) {
        const existingByEmail = await User.findOne({ where: { email } });
        if (existingByEmail) throw new AppError('Email already registered', 400);
      }
      const existingByName = await User.findOne({ where: { name } });
      if (existingByName) throw new AppError('Name already registered', 400);

      const createData = { name, email, password: userData.password };
      const user = await User.create(createData);
      return { user: user.getProfile() };
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
      // Accept either email or name in the identifier parameter
      const identifier = (email || '').trim();
      let user = null;
      if (identifier.includes('@')) {
        user = await User.findOne({ where: { email: identifier.toLowerCase(), is_active: true } });
      } else {
        user = await User.findOne({ where: { name: identifier, is_active: true } });
      }
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login (column is last_login)
      user.last_login = new Date();
      await user.save();

      return {
        user: user.getProfile(),
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
      const user = await User.findByPk(userId);
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
      const user = await User.findByPk(userId);
      if (!user) throw new AppError('User not found', 404);
      await user.update(updateData);
      return user.getProfile();
    } catch (error) {
      throw new AppError(`Failed to update profile: ${error.message}`, 400);
    }
  }
}

module.exports = new AuthService();