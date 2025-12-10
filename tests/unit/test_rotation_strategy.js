// tests/unit/test_rotation_strategy.js
const { 
  RotationContext, 
  NutrientBasedStrategy, 
  PestManagementStrategy, 
  SeasonalStrategy 
} = require('../../src/patterns/RotationStrategy');

describe('Rotation Strategy Pattern Tests', () => {
  let context;
  
  beforeEach(() => {
    context = new RotationContext();
  });
  
  describe('NutrientBasedStrategy', () => {
    test('should calculate rotation based on nutrient deficiencies', () => {
      context.setStrategy(new NutrientBasedStrategy());
      
      const mockData = {
        currentCrop: { 
          _id: '123', 
          family: 'Poaceae', 
          type: 'heavy-feeder' 
        },
        soilTestResults: { nitrogen: 20, phosphorus: 15 },
        availableCrops: [
          { 
            _id: '1', 
            name: 'Soybean', 
            family: 'Fabaceae', 
            nutrientRequirement: 'low', 
            nitrogenFixer: true,
            compatibility: []
          },
          { 
            _id: '2', 
            name: 'Corn', 
            family: 'Poaceae', 
            nutrientRequirement: 'high', 
            nitrogenFixer: false,
            compatibility: []
          }
        ]
      };
      
      const recommendations = context.executeRotation(mockData);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Soybean should be recommended (nitrogen fixer for low nitrogen)
      const soybeanRec = recommendations.find(r => r.crop.name === 'Soybean');
      expect(soybeanRec).toBeDefined();
      expect(soybeanRec.reason).toContain('Nitrogen');
    });
  });
  
  describe('PestManagementStrategy', () => {
    test('should avoid same family crops', () => {
      context.setStrategy(new PestManagementStrategy());
      
      const mockData = {
        currentCrop: { 
          _id: '123', 
          family: 'Solanaceae', 
          type: 'heavy-feeder' 
        },
        pestHistory: true,
        availableCrops: [
          { 
            _id: '1', 
            name: 'Tomato', 
            family: 'Solanaceae', 
            type: 'heavy-feeder' 
          },
          { 
            _id: '2', 
            name: 'Corn', 
            family: 'Poaceae', 
            type: 'moderate-feeder' 
          }
        ]
      };
      
      const recommendations = context.executeRotation(mockData);
      
      // Corn should score higher than Tomato (different family)
      const tomatoScore = recommendations.find(r => r.crop.name === 'Tomato')?.score || 0;
      const cornScore = recommendations.find(r => r.crop.name === 'Corn')?.score || 0;
      
      expect(cornScore).toBeGreaterThan(tomatoScore);
    });
  });
  
  describe('SeasonalStrategy', () => {
    test('should prefer crops suitable for current season', () => {
      context.setStrategy(new SeasonalStrategy());
      
      const mockData = {
        season: 'summer',
        climate: { rainfall: 500, tempRange: 'moderate' },
        availableCrops: [
          { 
            _id: '1', 
            name: 'Summer Crop', 
            family: 'Poaceae', 
            season: ['summer'],
            waterRequirement: 5,
            growthDuration: 80
          },
          { 
            _id: '2', 
            name: 'Winter Crop', 
            family: 'Brassicaceae', 
            season: ['winter'],
            waterRequirement: 4,
            growthDuration: 120
          }
        ]
      };
      
      const recommendations = context.executeRotation(mockData);
      const summerCrop = recommendations.find(r => r.crop.name === 'Summer Crop');
      const winterCrop = recommendations.find(r => r.crop.name === 'Winter Crop');
      
      expect(summerCrop.score).toBeGreaterThan(winterCrop.score);
      expect(summerCrop.reason).toContain('summer');
    });
  });
  
  describe('RotationContext', () => {
    test('should throw error if no strategy set', () => {
      expect(() => {
        context.executeRotation({});
      }).toThrow('No strategy set');
    });
    
    test('should allow strategy switching at runtime', () => {
      context.setStrategy(new NutrientBasedStrategy());
      expect(context.strategy).toBeInstanceOf(NutrientBasedStrategy);
      
      context.setStrategy(new PestManagementStrategy());
      expect(context.strategy).toBeInstanceOf(PestManagementStrategy);
    });
    
    test('should return available strategies', () => {
      const strategies = context.getAvailableStrategies();
      
      expect(strategies).toHaveProperty('nutrient');
      expect(strategies).toHaveProperty('pest');
      expect(strategies).toHaveProperty('seasonal');
      
      expect(strategies.nutrient).toBeInstanceOf(NutrientBasedStrategy);
      expect(strategies.pest).toBeInstanceOf(PestManagementStrategy);
      expect(strategies.seasonal).toBeInstanceOf(SeasonalStrategy);
    });
  });
});