// tests/unit/cropService.test.js
const cropService = require('../../src/services/cropService');
const Crop = require('../../src/models/Crop');

jest.mock('../../src/models/Crop');

describe('CropService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCrop', () => {
    it('should create a crop with valid data', async () => {
      const mockCrop = {
        id: 1,
        name: 'Wheat',
        family: 'Poaceae',
        acidity: 40,
        owner_email: 'alice',
      };
      Crop.findOne.mockResolvedValue(null);
      Crop.create.mockResolvedValue(mockCrop);

      const result = await cropService.createCrop({
        name: 'Wheat',
        family: 'Poaceae',
        acidity: 40,
        owner_email: 'alice',
      });

      expect(result).toEqual(mockCrop);
      expect(Crop.create).toHaveBeenCalled();
    });

    it('should fail if crop name already exists', async () => {
      const existingCrop = { id: 1, name: 'Wheat' };
      Crop.findOne.mockResolvedValue(existingCrop);

      await expect(cropService.createCrop({ name: 'Wheat', family: 'Poaceae' }))
        .rejects
        .toThrow('Crop with this name already exists');
    });

    it('should normalize owner_email to lowercase', async () => {
      const mockCrop = { id: 1, name: 'Beans', owner_email: 'alice' };
      Crop.findOne.mockResolvedValue(null);
      Crop.create.mockResolvedValue(mockCrop);

      await cropService.createCrop({
        name: 'Beans',
        family: 'Fabaceae',
        owner_email: 'Alice@Example.COM',
      });

      expect(Crop.create).toHaveBeenCalledWith(
        expect.objectContaining({ owner_email: 'alice@example.com' })
      );
    });
  });

  describe('getAllCrops', () => {
    it('should return all active crops', async () => {
      const mockCrops = [
        { id: 1, name: 'Wheat', is_active: true },
        { id: 2, name: 'Beans', is_active: true },
      ];
      Crop.findAll.mockResolvedValue(mockCrops);

      const result = await cropService.getAllCrops();

      expect(result).toEqual(mockCrops);
      expect(Crop.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_active: true }),
        })
      );
    });

    it('should filter crops by owner', async () => {
      const mockCrops = [{ id: 1, name: 'Wheat', owner_email: 'alice' }];
      Crop.findAll.mockResolvedValue(mockCrops);

      await cropService.getAllCrops({ owner: 'alice' });

      expect(Crop.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_active: true, owner_email: 'alice' }),
        })
      );
    });
  });

  describe('getCropById', () => {
    it('should return crop by ID', async () => {
      const mockCrop = { id: 1, name: 'Wheat' };
      Crop.findByPk.mockResolvedValue(mockCrop);

      const result = await cropService.getCropById(1);

      expect(result).toEqual(mockCrop);
      expect(Crop.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw if crop not found', async () => {
      Crop.findByPk.mockResolvedValue(null);

      await expect(cropService.getCropById(999))
        .rejects
        .toThrow('Crop not found');
    });
  });

  describe('updateCrop', () => {
    it('should update crop successfully', async () => {
      const mockCrop = {
        id: 1,
        name: 'Wheat',
        update: jest.fn().mockResolvedValue(true),
      };
      Crop.findByPk.mockResolvedValue(mockCrop);

      await cropService.updateCrop(1, { acidity: 45 });

      expect(mockCrop.update).toHaveBeenCalledWith({ acidity: 45 });
    });

    it('should fail if crop not found', async () => {
      Crop.findByPk.mockResolvedValue(null);

      await expect(cropService.updateCrop(999, { acidity: 45 }))
        .rejects
        .toThrow('Crop not found');
    });
  });

  describe('deleteCrop', () => {
    it('should soft delete crop (set is_active=false)', async () => {
      const mockCrop = {
        id: 1,
        name: 'Wheat',
        update: jest.fn().mockResolvedValue(true),
      };
      Crop.findByPk.mockResolvedValue(mockCrop);

      await cropService.deleteCrop(1);

      expect(mockCrop.update).toHaveBeenCalledWith({ is_active: false });
    });
  });

  describe('searchCrops', () => {
    it('should search crops by name or scientific_name', async () => {
      const mockCrops = [{ id: 1, name: 'Wheat' }];
      Crop.findAll.mockResolvedValue(mockCrops);

      await cropService.searchCrops('Wheat');

      expect(Crop.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ is_active: true }),
        })
      );
    });
  });
});
