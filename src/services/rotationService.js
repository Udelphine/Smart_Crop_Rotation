// src/services/rotationService.js
const RotationPlan = require('../models/RotationPlan');
const Crop = require('../models/Crop');
const { RotationContext, NutrientBasedStrategy, PestManagementStrategy, SeasonalStrategy } = require('../patterns/RotationStrategy');

class RotationService {
  constructor() {
    this.rotationContext = new RotationContext();
  }

  /**
   * Create rotation plan
   * @param {Object} planData - Rotation plan data
   * @returns {Promise<Object>}
   */
  async createRotationPlan(planData) {
    try {
      // Validate crop exists
      if (planData.currentCrop) {
        const crop = await Crop.findById(planData.currentCrop);
        if (!crop) {
          throw new Error('Current crop not found');
        }
      }

      const rotationPlan = new RotationPlan(planData);
      await rotationPlan.save();
      
      // Generate recommendations
      await this.generateRecommendations(rotationPlan._id);
      
      return await this.getRotationPlanById(rotationPlan._id);
    } catch (error) {
      throw new Error(`Failed to create rotation plan: ${error.message}`);
    }
  }

  /**
   * Get rotation plan by ID
   * @param {String} planId - Plan ID
   * @returns {Promise<Object>}
   */
  async getRotationPlanById(planId) {
    try {
      const plan = await RotationPlan.findById(planId)
        .populate('currentCrop')
        .populate('plannedCrops.crop')
        .populate('recommendations.crop');
      
      if (!plan) {
        throw new Error('Rotation plan not found');
      }
      
      return plan;
    } catch (error) {
      throw new Error(`Failed to fetch rotation plan: ${error.message}`);
    }
  }

  /**
   * Get all rotation plans for a farmer
   * @param {String} farmerId - Farmer ID
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>}
   */
  async getFarmerRotationPlans(farmerId, filters = {}) {
    try {
      const query = { farmerId };
      
      if (filters.status) query.status = filters.status;
      if (filters.fieldId) query.fieldId = filters.fieldId;
      
      const plans = await RotationPlan.find(query)
        .populate('currentCrop')
        .sort({ createdAt: -1 });
      
      return plans;
    } catch (error) {
      throw new Error(`Failed to fetch rotation plans: ${error.message}`);
    }
  }

  /**
   * Generate crop recommendations for a plan
   * @param {String} planId - Plan ID
   * @returns {Promise<Array>}
   */
  async generateRecommendations(planId) {
    try {
      const plan = await RotationPlan.findById(planId)
        .populate('currentCrop');
      
      if (!plan) {
        throw new Error('Rotation plan not found');
      }

      // Get all active crops
      const availableCrops = await Crop.find({ isActive: true });
      
      // Set strategy based on plan
      switch (plan.rotationStrategy) {
        case 'pest':
          this.rotationContext.setStrategy(new PestManagementStrategy());
          break;
        case 'seasonal':
          this.rotationContext.setStrategy(new SeasonalStrategy());
          break;
        default:
          this.rotationContext.setStrategy(new NutrientBasedStrategy());
      }

      // Prepare data for strategy
      const strategyData = {
        currentCrop: plan.currentCrop,
        soilTestResults: plan.soilTestResults,
        availableCrops,
        season: plan.plannedCrops[0]?.season || 'spring',
        climate: plan.climate || { rainfall: 500, tempRange: 'moderate' },
      };

      // Execute strategy
      const recommendations = this.rotationContext.executeRotation(strategyData);
      
      // Take top 5 recommendations
      const topRecommendations = recommendations.slice(0, 5);
      
      // Update plan with recommendations
      plan.recommendations = topRecommendations.map(rec => ({
        crop: rec.crop._id,
        reason: rec.reason,
        score: rec.score,
        expectedYield: this.calculateExpectedYield(rec.crop, plan.fieldSize),
      }));
      
      await plan.save();
      
      return plan.recommendations;
    } catch (error) {
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  /**
   * Calculate expected yield (simplified)
   * @param {Object} crop - Crop data
   * @param {Number} fieldSize - Field size
   * @returns {Number}
   */
  calculateExpectedYield(crop, fieldSize) {
    // Simplified calculation - in real app, use more complex formula
    const baseYield = {
      low: 2,
      medium: 4,
      high: 6,
    };
    
    const multiplier = baseYield[crop.nutrientRequirement] || 3;
    return fieldSize * multiplier;
  }

  /**
   * Update rotation plan
   * @param {String} planId - Plan ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>}
   */
  async updateRotationPlan(planId, updateData) {
    try {
      const plan = await RotationPlan.findByIdAndUpdate(
        planId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('currentCrop');
      
      if (!plan) {
        throw new Error('Rotation plan not found');
      }
      
      // Regenerate recommendations if strategy changed
      if (updateData.rotationStrategy || updateData.soilTestResults) {
        await this.generateRecommendations(planId);
      }
      
      return await this.getRotationPlanById(planId);
    } catch (error) {
      throw new Error(`Failed to update rotation plan: ${error.message}`);
    }
  }

  /**
   * Add crop to rotation sequence
   * @param {String} planId - Plan ID
   * @param {Object} cropData - Crop to add
   * @returns {Promise<Object>}
   */
  async addCropToRotation(planId, cropData) {
    try {
      // Validate crop exists
      const crop = await Crop.findById(cropData.crop);
      if (!crop) {
        throw new Error('Crop not found');
      }

      const plan = await RotationPlan.findById(planId);
      if (!plan) {
        throw new Error('Rotation plan not found');
      }

      // Determine order
      const order = plan.plannedCrops.length + 1;
      
      plan.plannedCrops.push({
        ...cropData,
        order,
      });
      
      await plan.save();
      
      return await this.getRotationPlanById(planId);
    } catch (error) {
      throw new Error(`Failed to add crop to rotation: ${error.message}`);
    }
  }

  /**
   * Delete rotation plan
   * @param {String} planId - Plan ID
   * @returns {Promise<Object>}
   */
  async deleteRotationPlan(planId) {
    try {
      const plan = await RotationPlan.findByIdAndUpdate(
        planId,
        { $set: { status: 'archived' } },
        { new: true }
      );
      
      if (!plan) {
        throw new Error('Rotation plan not found');
      }
      
      return { message: 'Rotation plan archived successfully' };
    } catch (error) {
      throw new Error(`Failed to delete rotation plan: ${error.message}`);
    }
  }
}

module.exports = new RotationService();