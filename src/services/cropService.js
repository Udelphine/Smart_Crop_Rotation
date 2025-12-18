// src/services/cropService.js
const { Op } = require('sequelize');
const Crop = require('../models/Crop');

class CropService {
  /**
   * Get all crops with filtering
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>}
   */
  async getAllCrops(filters = {}) {
  try {
    const where = { is_active: true };
    
    // Apply filters
    if (filters.family) where.family = filters.family;
    if (filters.nutrientRequirement) where.nutrient_requirement = filters.nutrientRequirement;
    
    // Handle season filter (season is stored as comma-separated string)
    if (filters.season) {
      where.season = { [Op.like]: `%${filters.season}%` };
    }
    
    if (filters.owner) where.owner_email = filters.owner;

    const crops = await Crop.findAll({ where, order: [['name', 'ASC']] });
    
    return crops;
  } catch (error) {
    throw new Error(`Failed to fetch crops: ${error.message}`);
  }
}
  /**
   * Get crop by ID
   * @param {String} id - Crop ID
   * @returns {Promise<Object>}
   */
  async getCropById(id) {
  try {
    const crop = await Crop.findByPk(id);
    
    if (!crop) {
      throw new Error('Crop not found');
    }
    
    return crop;
  } catch (error) {
    throw new Error(`Failed to fetch crop: ${error.message}`);
  }
}

  /**
   * Create new crop
   * @param {Object} cropData - Crop data
   * @returns {Promise<Object>}
   */
  async createCrop(cropData) {
  try {
    // Check if crop already exists
    const existingCrop = await Crop.findOne({ where: { name: cropData.name } });
    if (existingCrop) {
      throw new Error('Crop with this name already exists');
    }

    // normalize owner email if provided
    if (cropData.owner_email) cropData.owner_email = String(cropData.owner_email).toLowerCase().trim();

    const crop = await Crop.create({
      name: cropData.name,
      scientific_name: cropData.scientific_name,
      family: cropData.family,
      nutrient_requirement: cropData.nutrient_requirement,
      water_requirement: cropData.water_requirement,
      season: cropData.season,
      growth_duration: cropData.growth_duration,
      nitrogen_fixer: cropData.nitrogen_fixer,
      soil_type: cropData.soil_type,
      is_active: cropData.is_active !== undefined ? cropData.is_active : true,
      acidity: cropData.acidity || 0,
      owner_email: cropData.owner_email || null,
    });

    return crop;
  } catch (error) {
    throw new Error(`Failed to create crop: ${error.message}`);
  }
}

  /**
   * Update crop
   * @param {String} id - Crop ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>}
   */
  async updateCrop(id, updateData) {
    try {
      const crop = await Crop.findByPk(id);
      if (!crop) throw new Error('Crop not found');
      await crop.update(updateData);
      return crop;
    } catch (error) {
      throw new Error(`Failed to update crop: ${error.message}`);
    }
  }

  /**
   * Delete crop (soft delete)
   * @param {String} id - Crop ID
   * @returns {Promise<Object>}
   */
  async deleteCrop(id) {
    try {
      const crop = await Crop.findByPk(id);
      if (!crop) throw new Error('Crop not found');
      await crop.update({ is_active: false });
      return { message: 'Crop deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete crop: ${error.message}`);
    }
  }

  /**
   * Get crops by family
   * @param {String} family - Crop family
   * @returns {Promise<Array>}
   */
  async getCropsByFamily(family) {
    try {
      return await Crop.findByFamily(family);
    } catch (error) {
      throw new Error(`Failed to fetch crops by family: ${error.message}`);
    }
  }

  /**
   * Get compatible crops for a given crop
   * @param {String} cropId - Crop ID
   * @returns {Promise<Array>}
   */
  async getCompatibleCrops(cropId) {
    try {
      const crop = await this.getCropById(cropId);
      return crop.getCompatibleCrops();
    } catch (error) {
      throw new Error(`Failed to get compatible crops: ${error.message}`);
    }
  }

  /**
   * Search crops by name or scientific name
   * @param {String} searchTerm - Search term
   * @returns {Promise<Array>}
   */
  async searchCrops(searchTerm) {
    try {
      return await Crop.findAll({
        where: {
          is_active: true,
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { scientific_name: { [Op.like]: `%${searchTerm}%` } },
          ],
        },
        limit: 10,
      });
    } catch (error) {
      throw new Error(`Failed to search crops: ${error.message}`);
    }
  }
}

module.exports = new CropService();