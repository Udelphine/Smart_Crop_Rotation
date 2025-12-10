// src/controllers/cropController.js
const cropService = require('../services/cropService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');

class CropController {
  /**
   * Get all crops
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getAllCrops(req, res) {
    try {
      const filters = req.query;
      const crops = await cropService.getAllCrops(filters);
      successResponse(res, crops, 'Crops retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  /**
   * Get crop by ID
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getCropById(req, res) {
    try {
      const { id } = req.params;
      const crop = await cropService.getCropById(id);
      successResponse(res, crop, 'Crop retrieved successfully');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  /**
   * Create new crop
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async createCrop(req, res) {
    try {
      const cropData = req.body;
      const crop = await cropService.createCrop(cropData);
      successResponse(res, crop, 'Crop created successfully', 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Update crop
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async updateCrop(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const crop = await cropService.updateCrop(id, updateData);
      successResponse(res, crop, 'Crop updated successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Delete crop
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async deleteCrop(req, res) {
    try {
      const { id } = req.params;
      const result = await cropService.deleteCrop(id);
      successResponse(res, result, 'Crop deleted successfully');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  }

  /**
   * Get crops by family
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getCropsByFamily(req, res) {
    try {
      const { family } = req.params;
      const crops = await cropService.getCropsByFamily(family);
      successResponse(res, crops, 'Crops retrieved by family');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  /**
   * Get compatible crops
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async getCompatibleCrops(req, res) {
    try {
      const { cropId } = req.params;
      const compatibleCrops = await cropService.getCompatibleCrops(cropId);
      successResponse(res, compatibleCrops, 'Compatible crops retrieved');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  /**
   * Search crops
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async searchCrops(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        throw new AppError('Search query is required', 400);
      }
      const crops = await cropService.searchCrops(q);
      successResponse(res, crops, 'Search results');
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

module.exports = new CropController();