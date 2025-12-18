// src/models/Crop.js
const { DataTypes } = require('sequelize');
const database = require('../utils/database');

const Crop = database.getSequelize().define('Crop', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  scientific_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  family: {
    type: DataTypes.ENUM(
      'Poaceae',
      'Fabaceae',
      'Solanaceae',
      'Brassicaceae',
      'Cucurbitaceae',
      'Asteraceae',
      'Other'
    ),
    allowNull: false,
    defaultValue: 'Other',
  },
  nutrient_requirement: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium',
  },
  water_requirement: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 5.0,
    validate: {
      min: 0,
      max: 10,
    },
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'spring,summer',
    get() {
      const rawValue = this.getDataValue('season');
      return rawValue ? rawValue.split(',') : [];
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('season', value.join(','));
      } else {
        this.setDataValue('season', value);
      }
    },
  },
  growth_duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 90,
    validate: {
      min: 30,
      max: 365,
    },
  },
  nitrogen_fixer: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  soil_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'loamy',
    get() {
      const rawValue = this.getDataValue('soil_type');
      return rawValue ? rawValue.split(',') : [];
    },
    set(value) {
      if (Array.isArray(value)) {
        this.setDataValue('soil_type', value.join(','));
      } else {
        this.setDataValue('soil_type', value);
      }
    },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  acidity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100,
    },
  },
  owner_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'crops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (crop) => {
      // Ensure name is trimmed
      if (crop.name) {
        crop.name = crop.name.trim();
      }
    },
  },
});

// Instance methods
Crop.prototype.getType = function() {
  if (this.nitrogen_fixer) return 'nitrogen-fixer';
  if (this.nutrient_requirement === 'high') return 'heavy-feeder';
  if (this.nutrient_requirement === 'low') return 'light-feeder';
  return 'moderate-feeder';
};

// Static methods
Crop.findByFamily = function(family) {
  return this.findAll({
    where: {
      family,
      is_active: true,
    },
  });
};

module.exports = Crop;