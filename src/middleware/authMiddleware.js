// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { AppError } = require('../utils/errorHandler');

/**
 * Authentication middleware
 */
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Add user to request
    req.user = {
      id: decoded.id,
      token,
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Authorization middleware
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // This would typically check user role from database
      // For now, we'll accept role from token or get from database
      
      // In a real app, you would fetch user from database to check role
      // const user = await User.findById(req.user.id);
      
      // For this example, we'll accept role from request body or assume 'farmer'
      const userRole = req.user.role || 'farmer';
      
      if (!roles.includes(userRole)) {
        throw new AppError('Access denied. Insufficient permissions.', 403);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication (for public routes that can work with or without auth)
 */
const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = {
        id: decoded.id,
        token,
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate,
};