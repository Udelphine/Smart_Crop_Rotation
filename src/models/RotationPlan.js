// src/models/RotationPlan.js
const { DataTypes } = require('sequelize');
const database = require('../utils/database');

const RotationPlan = database.getSequelize().define('RotationPlan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  field_id: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  field_size: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.1,
    },
  },
  unit: {
    type: DataTypes.ENUM('acre', 'hectare'),
    allowNull: false,
    defaultValue: 'hectare',
  },
  current_crop_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  soil_nitrogen: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  soil_phosphorus: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  soil_potassium: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  soil_ph: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 14,
    },
  },
  soil_organic_matter: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  rotation_strategy: {
    type: DataTypes.ENUM('nutrient', 'pest', 'seasonal', 'mixed'),
    allowNull: false,
    defaultValue: 'nutrient',
  },
  rotation_duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
    validate: {
      min: 1,
      max: 10,
    },
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
    allowNull: false,
    defaultValue: 'draft',
  },
  planned_crops_json: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('planned_crops_json');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('planned_crops_json', JSON.stringify(value));
    },
  },
  recommendations_json: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('recommendations_json');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('recommendations_json', JSON.stringify(value));
    },
  },
}, {
  tableName: 'rotation_plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Instance methods
RotationPlan.prototype.getSoilTestResults = function() {
  return {
    nitrogen: this.soil_nitrogen,
    phosphorus: this.soil_phosphorus,
    potassium: this.soil_potassium,
    ph: this.soil_ph,
    organicMatter: this.soil_organic_matter,
  };
};

RotationPlan.prototype.setSoilTestResults = function(results) {
  if (results.nitrogen !== undefined) this.soil_nitrogen = results.nitrogen;
  if (results.phosphorus !== undefined) this.soil_phosphorus = results.phosphorus;
  if (results.potassium !== undefined) this.soil_potassium = results.potassium;
  if (results.ph !== undefined) this.soil_ph = results.ph;
  if (results.organicMatter !== undefined) this.soil_organic_matter = results.organicMatter;
};

RotationPlan.prototype.getCurrentCrop = function() {
  const plannedCrops = this.planned_crops_json || [];
  return plannedCrops.find(crop => crop.order === 1);
};

// Static methods
RotationPlan.findActiveRotations = function(farmerId) {
  return this.findAll({
    where: {
      farmer_id: farmerId,
      status: 'active',
    },
  });
};

module.exports = RotationPlan;