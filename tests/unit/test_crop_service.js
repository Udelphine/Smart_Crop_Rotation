// tests/unit/test_crop_service.js
const Crop = require('../../src/models/Crop');
const cropService = require('../../src/services/cropService');
const database = require('../../src/utils/database');

describe('Crop Service Tests', () => {
  beforeAll(async () => {
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Close database connection
    const sequelize = database.getSequelize();
    if (sequelize) {
      await sequelize.close();
    }
  });

  beforeEach(async () => {
    // Clear crops table
    const sequelize = database.getSequelize();
    if (sequelize) {
      await Crop.destroy({ where: {}, truncate: true });
    }
  });

  describe('createCrop', () => {
    test('should create a new crop successfully', async () => {
      const cropData = {
        name: 'Test Crop',
        family: 'Poaceae',
        nutrient_requirement: 'medium',
        water_requirement: 5,
        season: ['spring', 'summer'],
      };

      const crop = await cropService.createCrop(cropData);

      expect(crop).toHaveProperty('id');
      expect(crop.name).toBe('Test Crop');
      expect(crop.family).toBe('Poaceae');
      expect(crop.is_active).toBe(true);
    });

    test('should throw error for duplicate crop name', async () => {
      const cropData = {
        name: 'Duplicate Crop',
        family: 'Poaceae',
      };

      await cropService.createCrop(cropData);
      
      await expect(cropService.createCrop(cropData))
        .rejects
        .toThrow('Crop with this name already exists');
    });
  });

  describe('getAllCrops', () => {
    test('should return all active crops', async () => {
      // Create test crops
      await Crop.create([
        { name: 'Crop 1', family: 'Poaceae', is_active: true },
        { name: 'Crop 2', family: 'Fabaceae', is_active: true },
        { name: 'Crop 3', family: 'Poaceae', is_active: false }, // Inactive
      ]);

      const crops = await cropService.getAllCrops();

      expect(crops).toHaveLength(2);
      expect(crops[0].name).toBe('Crop 1');
      expect(crops[1].name).toBe('Crop 2');
    });
  });
});