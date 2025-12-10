// src/controllers/authController.js
const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHandler');

class AuthController {
  /**
   * Register new user
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async register(req, res) {
    try {
      const userData = req.body;
      const result = await authService.register(userData);
      successResponse(res, result, 'User registered successfully', 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return errorResponse(res, 'Email and password are required', 400);
      }
      
      const result = await authService.login(email, password);
      successResponse(res, result, 'Login successful');
    } catch (error) {
      errorResponse(res, error.message, 401);
    }
  }

  /**
   * Get user profile
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.id);
      successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async updateProfile(req, res) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      successResponse(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Verify token
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return errorResponse(res, 'No token provided', 401);
      }
      
      const decoded = authService.verifyToken(token);
      successResponse(res, { valid: true, user: decoded }, 'Token is valid');
    } catch (error) {
      errorResponse(res, 'Invalid token', 401);
    }
  }
}

module.exports = new AuthController();