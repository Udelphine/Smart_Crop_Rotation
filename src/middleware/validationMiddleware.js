// src/middleware/validationMiddleware.js
const { AppError } = require('../utils/errorHandler');

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
      });
      
      if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        throw new AppError(`Validation error: ${errorMessages}`, 400);
      }
      
      // Replace with validated data
      req[property] = value;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if ID is valid MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      
      // Simple MongoDB ObjectId validation
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      
      if (!objectIdRegex.test(id)) {
        throw new AppError(`Invalid ${paramName} format`, 400);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check required fields
 */
const checkRequiredFields = (fields) => {
  return (req, res, next) => {
    try {
      const missingFields = [];
      
      fields.forEach(field => {
        if (!req.body[field] && req.body[field] !== 0 && req.body[field] !== false) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        throw new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Trim string fields
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].trim();
        }
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validate,
  validateObjectId,
  checkRequiredFields,
  sanitizeInput,
};