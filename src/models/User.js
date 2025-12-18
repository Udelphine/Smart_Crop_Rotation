// src/models/User.js
const { DataTypes } = require('sequelize');
const database = require('../utils/database');
const bcrypt = require('bcryptjs');

const User = database.getSequelize().define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      notEmpty: false,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      // allow non-email identifiers; skip strict email validation
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  role: {
    type: DataTypes.ENUM('farmer', 'admin', 'agronomist'),
    allowNull: false,
    defaultValue: 'farmer',
  },
  farm_size: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  location_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location_city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location_state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location_country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location_lat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  location_lng: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
      // If no name provided, derive from email local-part or fallback
      if (!user.name && user.email) {
        const local = user.email.split('@')[0];
        user.name = local || 'User';
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.getProfile = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    role: this.role,
    farm_size: this.farm_size,
    location: {
      address: this.location_address,
      city: this.location_city,
      state: this.location_state,
      country: this.location_country,
      coordinates: {
        lat: this.location_lat,
        lng: this.location_lng,
      },
    },
  };
};

module.exports = User;