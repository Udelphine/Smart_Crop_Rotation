// src/controllers/rotationController.js
const rotationService = require('../services/rotationService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');

class RotationController {
  /**
   * Create rotation plan
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async createRotationPlan(req, res) {
    try {
      const planData = {
        ...req.body,
        farmerId: req.user.id, // From authentication middleware
      };
      const plan = await rotationService.createRotationPlan(planData);
      successResponse(res, plan, 'Rotation plan created successfully', 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get rotation plan by ID
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getRotationPlanById(req, res) {
    try {
      const { id } = req.params;
      const plan = await rotationService.getRotationPlanById(id);
      
      // Check if user owns this plan
      if (plan.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access to rotation plan', 403);
      }
      
      successResponse(res, plan, 'Rotation plan retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  /**
   * Get farmer's rotation plans
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getFarmerRotationPlans(req, res) {
    try {
      const farmerId = req.user.id;
      const filters = req.query;
      const plans = await rotationService.getFarmerRotationPlans(farmerId, filters);
      successResponse(res, plans, 'Rotation plans retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  /**
   * Generate recommendations for plan
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async generateRecommendations(req, res) {
    try {
      const { planId } = req.params;
      
      // First get plan to check ownership
      const plan = await rotationService.getRotationPlanById(planId);
      if (plan.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const recommendations = await rotationService.generateRecommendations(planId);
      successResponse(res, recommendations, 'Recommendations generated successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update rotation plan
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async updateRotationPlan(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check ownership before update
      const plan = await rotationService.getRotationPlanById(id);
      if (plan.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const updatedPlan = await rotationService.updateRotationPlan(id, updateData);
      successResponse(res, updatedPlan, 'Rotation plan updated successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Add crop to rotation
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async addCropToRotation(req, res) {
    try {
      const { planId } = req.params;
      const cropData = req.body;
      
      // Check ownership
      const plan = await rotationService.getRotationPlanById(planId);
      if (plan.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const updatedPlan = await rotationService.addCropToRotation(planId, cropData);
      successResponse(res, updatedPlan, 'Crop added to rotation successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete rotation plan
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async deleteRotationPlan(req, res) {
    try {
      const { planId } = req.params;
      
      // Check ownership
      const plan = await rotationService.getRotationPlanById(planId);
      if (plan.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }
      
      const result = await rotationService.deleteRotationPlan(planId);
      successResponse(res, result, 'Rotation plan deleted successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get rotation strategies
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getRotationStrategies(req, res) {
    try {
      const { RotationContext } = require('../patterns/RotationStrategy');
      const context = new RotationContext();
      const strategies = context.getAvailableStrategies();
      
      const strategyInfo = Object.entries(strategies).map(([key, strategy]) => ({
        key,
        name: strategy.getName(),
        description: strategy.getDescription(),
      }));
      
      successResponse(res, strategyInfo, 'Rotation strategies retrieved');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

module.exports = new RotationController();