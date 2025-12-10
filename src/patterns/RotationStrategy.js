// src/patterns/RotationStrategy.js
/**
 * Strategy Pattern Implementation for Crop Rotation
 * Following the Open/Closed Principle - open for extension, closed for modification
 */

// Strategy Interface
class RotationStrategy {
  /**
   * Calculate optimal rotation based on strategy
   * @param {Object} data - Field and crop data
   * @returns {Array} - Recommended crops
   */
  calculateRotation(data) {
    throw new Error('Method not implemented');
  }

  /**
   * Get strategy name
   * @returns {String}
   */
  getName() {
    return this.constructor.name;
  }

  /**
   * Get strategy description
   * @returns {String}
   */
  getDescription() {
    return 'Base rotation strategy';
  }
}

// Concrete Strategy 1: Nutrient-based Rotation
class NutrientBasedStrategy extends RotationStrategy {
  calculateRotation(data) {
    const { currentCrop, soilTestResults, availableCrops } = data;
    const recommendations = [];

    // Analyze soil nutrients
    const nutrientDeficiencies = this.analyzeSoil(soilTestResults);

    // Score each available crop based on nutrient needs
    availableCrops.forEach((crop) => {
      let score = 0;

      // Avoid same crop family
      if (currentCrop && crop.family === currentCrop.family) {
        score -= 3;
      }

      // Match crop nutrient needs with soil status
      score += this.matchNutrientNeeds(crop, nutrientDeficiencies);

      // Prefer nitrogen fixers if nitrogen is low
      if (nutrientDeficiencies.nitrogen && crop.nitrogenFixer) {
        score += 2;
      }

      // Consider crop compatibility
      score += this.checkCompatibility(currentCrop, crop);

      recommendations.push({
        crop,
        score,
        reason: this.generateReason(crop, score, nutrientDeficiencies),
      });
    });

    // Sort by score descending
    return recommendations.sort((a, b) => b.score - a.score);
  }

  analyzeSoil(soilTestResults) {
    const deficiencies = {
      nitrogen: soilTestResults?.nitrogen < 30,
      phosphorus: soilTestResults?.phosphorus < 20,
      potassium: soilTestResults?.potassium < 25,
      organicMatter: soilTestResults?.organicMatter < 3,
    };
    return deficiencies;
  }

  matchNutrientNeeds(crop, deficiencies) {
    let score = 0;
    
    if (deficiencies.nitrogen && crop.nutrientRequirement === 'low') {
      score += 2;
    }
    
    if (deficiencies.phosphorus && crop.nutrientRequirement !== 'high') {
      score += 1;
    }

    return score;
  }

  checkCompatibility(currentCrop, nextCrop) {
    if (!currentCrop || !nextCrop.compatibility) return 0;
    
    const compat = nextCrop.compatibility.find(
      (c) => c.crop.toString() === currentCrop._id.toString()
    );
    return compat ? compat.score - 5 : 0; // Normalize score
  }

  generateReason(crop, score, deficiencies) {
    const reasons = [];
    
    if (crop.nitrogenFixer && deficiencies.nitrogen) {
      reasons.push('Nitrogen fixing crop needed');
    }
    
    if (score > 0) {
      reasons.push('Good nutrient match');
    }

    return reasons.join(', ') || 'Moderate match';
  }

  getDescription() {
    return 'Focuses on balancing soil nutrients through strategic crop sequencing';
  }
}

// Concrete Strategy 2: Pest Management Strategy
class PestManagementStrategy extends RotationStrategy {
  calculateRotation(data) {
    const { currentCrop, pestHistory, availableCrops } = data;
    const recommendations = [];

    availableCrops.forEach((crop) => {
      let score = 10; // Start with perfect score

      // Heavy penalty for same family (pest carryover)
      if (currentCrop && crop.family === currentCrop.family) {
        score -= 8;
      }

      // Check pest history
      if (pestHistory && this.hasCommonPests(pestHistory, crop.family)) {
        score -= 4;
      }

      // Bonus for pest-resistant or different family crops
      if (currentCrop && crop.family !== currentCrop.family) {
        score += 3;
      }

      // Prefer crops with different growth habits
      score += this.assessGrowthHabitChange(currentCrop, crop);

      recommendations.push({
        crop,
        score: Math.max(0, score), // No negative scores
        reason: this.generateReason(crop, score),
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  hasCommonPests(pestHistory, cropFamily) {
    // Simplified check - in real app, use pest database
    const pestProneFamilies = ['Solanaceae', 'Brassicaceae'];
    return pestHistory && pestProneFamilies.includes(cropFamily);
  }

  assessGrowthHabitChange(currentCrop, nextCrop) {
    if (!currentCrop) return 0;
    
    // Different growth habits disrupt pest cycles
    const currentType = currentCrop.type || 'moderate-feeder';
    const nextType = nextCrop.type || 'moderate-feeder';
    
    return currentType !== nextType ? 2 : 0;
  }

  generateReason(crop, score) {
    if (score >= 8) return 'Excellent pest cycle disruption';
    if (score >= 6) return 'Good pest management choice';
    if (score >= 4) return 'Moderate pest control';
    return 'Consider alternative for better pest control';
  }

  getDescription() {
    return 'Focuses on breaking pest and disease cycles through crop diversity';
  }
}

// Concrete Strategy 3: Seasonal Rotation Strategy
class SeasonalStrategy extends RotationStrategy {
  calculateRotation(data) {
    const { season, climate, availableCrops } = data;
    const recommendations = [];

    availableCrops.forEach((crop) => {
      let score = 0;

      // Check if crop is suitable for the season
      if (crop.season && crop.season.includes(season)) {
        score += 5;
      }

      // Consider climate adaptation
      score += this.assessClimateSuitability(crop, climate);

      // Consider growth duration vs season length
      score += this.checkGrowthDuration(crop, season);

      // Water requirement match
      if (climate && climate.rainfall) {
        const waterMatch = this.matchWaterRequirement(crop, climate.rainfall);
        score += waterMatch;
      }

      recommendations.push({
        crop,
        score,
        reason: this.generateReason(crop, score, season),
      });
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  assessClimateSuitability(crop, climate) {
    if (!climate) return 0;
    
    let score = 0;
    
    // Temperature suitability (simplified)
    if (climate.tempRange) {
      if (crop.family === 'Poaceae' && climate.tempRange === 'moderate') {
        score += 2;
      }
    }

    return score;
  }

  checkGrowthDuration(crop, season) {
    const seasonLengths = {
      spring: 90,
      summer: 90,
      autumn: 90,
      winter: 90,
    };
    
    const availableDays = seasonLengths[season] || 90;
    
    if (crop.growthDuration <= availableDays) {
      return 2;
    }
    
    return -1; // Penalty for crops that won't mature
  }

  matchWaterRequirement(crop, rainfall) {
    const waterScore = {
      low: [0, 300],
      medium: [300, 600],
      high: [600, 1000],
    };
    
    const requirement = crop.waterRequirement || 5;
    const idealRange = waterScore[this.getWaterCategory(requirement)];
    
    if (rainfall >= idealRange[0] && rainfall <= idealRange[1]) {
      return 3;
    }
    
    return 0;
  }

  getWaterCategory(requirement) {
    if (requirement <= 3) return 'low';
    if (requirement <= 7) return 'medium';
    return 'high';
  }

  generateReason(crop, score, season) {
    const reasons = [];
    
    if (crop.season && crop.season.includes(season)) {
      reasons.push(`Suitable for ${season}`);
    }
    
    if (score > 7) reasons.push('Excellent seasonal match');
    
    return reasons.join(', ') || 'Seasonal suitability unknown';
  }

  getDescription() {
    return 'Focuses on matching crops to seasonal conditions and climate';
  }
}

// Context Class that uses the Strategy
class RotationContext {
  constructor(strategy = null) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    if (!(strategy instanceof RotationStrategy)) {
      throw new Error('Strategy must be an instance of RotationStrategy');
    }
    this.strategy = strategy;
  }

  executeRotation(data) {
    if (!this.strategy) {
      throw new Error('No strategy set. Use setStrategy() first.');
    }

    console.log(`Executing ${this.strategy.getName()} strategy`);
    return this.strategy.calculateRotation(data);
  }

  getAvailableStrategies() {
    return {
      nutrient: new NutrientBasedStrategy(),
      pest: new PestManagementStrategy(),
      seasonal: new SeasonalStrategy(),
    };
  }
}

module.exports = {
  RotationStrategy,
  NutrientBasedStrategy,
  PestManagementStrategy,
  SeasonalStrategy,
  RotationContext,
};