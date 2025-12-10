// docker/mongo-init.js
// MongoDB initialization script for Docker

db = db.getSiblingDB('crop_rotation');

// Create application user
db.createUser({
  user: 'appuser',
  pwd: 'apppassword123',
  roles: [
    { role: 'readWrite', db: 'crop_rotation' },
    { role: 'dbAdmin', db: 'crop_rotation' }
  ]
});

// Create collections with validation
db.createCollection('crops', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'family'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        family: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        is_active: {
          bsonType: 'bool',
          description: 'must be a boolean'
        }
      }
    }
  }
});

db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        role: {
          enum: ['farmer', 'admin', 'agronomist'],
          description: 'must be one of the enum values'
        }
      }
    }
  }
});

// Insert initial crop data
db.crops.insertMany([
  {
    name: 'Corn',
    scientific_name: 'Zea mays',
    family: 'Poaceae',
    nutrient_requirement: 'high',
    water_requirement: 7,
    season: 'spring,summer',
    growth_duration: 90,
    nitrogen_fixer: false,
    soil_type: 'loamy',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Soybean',
    scientific_name: 'Glycine max',
    family: 'Fabaceae',
    nutrient_requirement: 'low',
    water_requirement: 6,
    season: 'spring,summer',
    growth_duration: 100,
    nitrogen_fixer: true,
    soil_type: 'loamy,sandy',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Wheat',
    scientific_name: 'Triticum aestivum',
    family: 'Poaceae',
    nutrient_requirement: 'medium',
    water_requirement: 5,
    season: 'autumn,winter',
    growth_duration: 120,
    nitrogen_fixer: false,
    soil_type: 'loamy,clay',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Tomato',
    scientific_name: 'Solanum lycopersicum',
    family: 'Solanaceae',
    nutrient_requirement: 'high',
    water_requirement: 8,
    season: 'spring,summer',
    growth_duration: 85,
    nitrogen_fixer: false,
    soil_type: 'loamy',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

console.log('✅ MongoDB initialized successfully');
console.log('📊 Crops collection created with sample data');
console.log('👤 Application user created: appuser');