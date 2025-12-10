// src/routes.js
const express = require('express');
const cropController = require('./controllers/cropController');
const rotationController = require('./controllers/rotationController');
const authController = require('./controllers/authController');
const { authenticate, authorize } = require('./middleware/authMiddleware');
const { validateObjectId, sanitizeInput } = require('./middleware/validationMiddleware');

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitizeInput);

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/verify', authController.verifyToken);

// Public crop routes (read-only)
router.get('/crops', cropController.getAllCrops);
router.get('/crops/search', cropController.searchCrops);
router.get('/crops/family/:family', cropController.getCropsByFamily);
router.get('/crops/:id', validateObjectId(), cropController.getCropById);
router.get('/crops/:cropId/compatible', validateObjectId('cropId'), cropController.getCompatibleCrops);

// Protected routes (require authentication)
router.use(authenticate);

// User routes
router.get('/auth/profile', authController.getProfile);
router.put('/auth/profile', authController.updateProfile);

// Protected crop routes (admin only for write operations)
router.post('/crops', authorize('admin'), cropController.createCrop);
router.put('/crops/:id', authorize('admin'), validateObjectId(), cropController.updateCrop);
router.delete('/crops/:id', authorize('admin'), validateObjectId(), cropController.deleteCrop);

// Rotation plan routes
router.get('/rotation/strategies', rotationController.getRotationStrategies);
router.post('/rotation/plans', rotationController.createRotationPlan);
router.get('/rotation/plans', rotationController.getFarmerRotationPlans);
router.get('/rotation/plans/:id', validateObjectId(), rotationController.getRotationPlanById);
router.put('/rotation/plans/:id', validateObjectId(), rotationController.updateRotationPlan);
router.delete('/rotation/plans/:id', validateObjectId(), rotationController.deleteRotationPlan);
router.post('/rotation/plans/:planId/crops', validateObjectId('planId'), rotationController.addCropToRotation);
router.post('/rotation/plans/:planId/recommendations', validateObjectId('planId'), rotationController.generateRecommendations);

// Admin only routes
router.get('/admin/rotation/all', authorize('admin'), async (req, res) => {
  // This would fetch all rotation plans for admin
  res.json({ message: 'Admin access to all rotation plans' });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Smart Crop Rotation Management System',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 handler for API routes - FIXED WILDCARD
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = router;
