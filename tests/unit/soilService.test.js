// tests/unit/soilService.test.js
const soilService = require('../../src/services/soilService');

describe('SoilService', () => {
  beforeEach(() => {
    soilService.soilHP = 50; // reset to default
  });

  describe('getSoil', () => {
    it('should return current soil HP', () => {
      soilService.soilHP = 50;
      const result = soilService.getSoil();
      expect(result).toEqual({ hp: 50 });
    });
  });

  describe('setSoil', () => {
    it('should set soil HP to a valid number', () => {
      const result = soilService.setSoil(65);
      expect(result).toEqual({ hp: 65 });
      expect(soilService.soilHP).toBe(65);
    });

    it('should accept string numbers and convert', () => {
      const result = soilService.setSoil('75');
      expect(result).toEqual({ hp: 75 });
    });

    it('should throw error for invalid values', () => {
      expect(() => soilService.setSoil('abc')).toThrow('Invalid hp value');
      expect(() => soilService.setSoil(null)).toThrow('Invalid hp value');
    });
  });

  describe('checkAcidity', () => {
    it('should return match=true when acidity <= soilHP', () => {
      soilService.soilHP = 50;
      const result = soilService.checkAcidity(45);
      expect(result).toEqual({ acidity: 45, soilHP: 50, match: true });
    });

    it('should return match=true when acidity equals soilHP', () => {
      soilService.soilHP = 50;
      const result = soilService.checkAcidity(50);
      expect(result).toEqual({ acidity: 50, soilHP: 50, match: true });
    });

    it('should return match=false when acidity > soilHP', () => {
      soilService.soilHP = 50;
      const result = soilService.checkAcidity(55);
      expect(result).toEqual({ acidity: 55, soilHP: 50, match: false });
    });

    it('should accept string numbers', () => {
      soilService.soilHP = 50;
      const result = soilService.checkAcidity('45');
      expect(result.match).toBe(true);
    });

    it('should throw error for invalid acidity', () => {
      expect(() => soilService.checkAcidity('xyz')).toThrow('Invalid acidity');
    });
  });
});
