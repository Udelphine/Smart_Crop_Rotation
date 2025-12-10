# API Endpoints Documentation

## Base URL
http://localhost:3000/api/v1

---

## 🔐 Authentication Endpoints

### Register New User
```http
POST /auth/register
Content-Type: application/json
{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123",
  "role": "farmer",
  "farm_size": 50,
  "location": {
    "address": "123 Farm Road",
    "city": "Agri City",
    "state": "Farm State",
    "country": "Farmland"
  }
}
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "farmer",
      "farm_size": 50
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
POST /auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "password123"
}
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "farmer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
GET /auth/profile
Authorization: Bearer <your_jwt_token>
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "farmer",
    "farm_size": 50,
    "location": {
      "address": "123 Farm Road",
      "city": "Agri City",
      "state": "Farm State",
      "country": "Farmland"
    }
  }
}
GET /auth/verify
Authorization: Bearer <your_jwt_token>
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "user": {
      "id": 1
    }
  }
}
GET /crops
GET /crops?family=Poaceae&season=spring
{
  "success": true,
  "message": "Crops retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Corn",
      "scientific_name": "Zea mays",
      "family": "Poaceae",
      "nutrient_requirement": "high",
      "water_requirement": 7,
      "season": ["spring", "summer"],
      "growth_duration": 90,
      "nitrogen_fixer": false,
      "soil_type": ["loamy"],
      "is_active": true,
      "created_at": "2024-12-09T10:00:00.000Z",
      "updated_at": "2024-12-09T10:00:00.000Z"
    }
  ]
}
GET /crops/{id}
GET /crops/1
{
  "success": true,
  "message": "Crop retrieved successfully",
  "data": {
    "id": 1,
    "name": "Corn",
    "scientific_name": "Zea mays",
    "family": "Poaceae",
    "nutrient_requirement": "high",
    "water_requirement": 7,
    "season": ["spring", "summer"],
    "growth_duration": 90,
    "nitrogen_fixer": false,
    "soil_type": ["loamy"],
    "is_active": true
  }
}
POST /crops
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "name": "New Crop",
  "scientific_name": "Scientific Name",
  "family": "Poaceae",
  "nutrient_requirement": "medium",
  "water_requirement": 5,
  "season": ["spring", "summer"],
  "growth_duration": 90,
  "nitrogen_fixer": false,
  "soil_type": ["loamy"]
}
{
  "success": true,
  "message": "Crop created successfully",
  "data": {
    "id": 5,
    "name": "New Crop",
    "family": "Poaceae",
    "nutrient_requirement": "medium",
    "is_active": true
  }
}
PUT /crops/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json
{
  "water_requirement": 6,
  "season": ["spring", "summer", "autumn"]
}
{
  "success": true,
  "message": "Crop updated successfully",
  "data": {
    "id": 1,
    "name": "Corn",
    "water_requirement": 6,
    "season": ["spring", "summer", "autumn"]
  }
}
DELETE /crops/{id}
Authorization: Bearer <admin_token>
{
  "success": true,
  "message": "Crop deleted successfully",
  "data": {
    "message": "Crop marked as inactive"
  }
}
GET /crops/search
{
  "success": true,
  "message": "Search results",
  "data": [
    {
      "id": 1,
      "name": "Corn",
      "family": "Poaceae",
      "scientific_name": "Zea mays"
    }
  ]
}
GET /crops/family/{family}
{
  "success": true,
  "message": "Crops retrieved by family",
  "data": [
    {
      "id": 1,
      "name": "Corn",
      "family": "Poaceae"
    },
    {
      "id": 3,
      "name": "Wheat",
      "family": "Poaceae"
    }
  ]
}
GET /rotation/strategies
Authorization: Bearer <token>
{
  "success": true,
  "message": "Rotation strategies retrieved",
  "data": [
    {
      "key": "nutrient",
      "name": "NutrientBasedStrategy",
      "description": "Focuses on balancing soil nutrients through strategic crop sequencing"
    },
    {
      "key": "pest",
      "name": "PestManagementStrategy", 
      "description": "Focuses on breaking pest and disease cycles through crop diversity"
    },
    {
      "key": "seasonal",
      "name": "SeasonalStrategy",
      "description": "Focuses on matching crops to seasonal conditions and climate"
    }
  ]
}
POST /rotation/plans
Authorization: Bearer <token>
Content-Type: application/json
{
  "field_id": "field_001",
  "field_size": 10,
  "unit": "hectare",
  "current_crop_id": 1,
  "soil_test_results": {
    "nitrogen": 25,
    "phosphorus": 30,
    "potassium": 40,
    "ph": 6.5,
    "organic_matter": 2.5
  },
  "rotation_strategy": "nutrient",
  "rotation_duration": 3,
  "planned_crops": [
    {
      "crop_id": 1,
      "season": "spring",
      "year": 2024,
      "order": 1
    }
  ]
}
{
  "success": true,
  "message": "Rotation plan created successfully",
  "data": {
    "id": 1,
    "farmer_id": 1,
    "field_id": "field_001",
    "rotation_strategy": "nutrient",
    "status": "draft",
    "recommendations": [
      {
        "crop_id": 2,
        "reason": "Good nutrient match",
        "score": 8.5,
        "expected_yield": 40
      }
    ]
  }
}
GET /rotation/plans
Authorization: Bearer <token>
{
  "success": true,
  "message": "Rotation plans retrieved successfully",
  "data": [
    {
      "id": 1,
      "field_id": "field_001",
      "field_size": 10,
      "rotation_strategy": "nutrient",
      "status": "draft",
      "created_at": "2024-12-09T10:00:00.000Z"
    }
  ]
}
GET /rotation/plans/{id}
Authorization: Bearer <token>
{
  "success": true,
  "message": "Rotation plan retrieved successfully",
  "data": {
    "id": 1,
    "farmer_id": 1,
    "field_id": "field_001",
    "field_size": 10,
    "current_crop": {
      "id": 1,
      "name": "Corn",
      "family": "Poaceae"
    },
    "rotation_strategy": "nutrient",
    "soil_test_results": {
      "nitrogen": 25,
      "phosphorus": 30,
      "potassium": 40
    },
    "planned_crops": [
      {
        "crop": {
          "id": 1,
          "name": "Corn"
        },
        "season": "spring",
        "order": 1
      }
    ],
    "recommendations": [
      {
        "crop": {
          "id": 2,
          "name": "Soybean"
        },
        "reason": "Nitrogen fixing crop needed",
        "score": 9.0
      }
    ]
  }
}
PUT /rotation/plans/{id}
Authorization: Bearer <token>
Content-Type: application/json
{
  "status": "active",
  "rotation_strategy": "pest"
}
{
  "success": true,
  "message": "Rotation plan updated successfully",
  "data": {
    "id": 1,
    "status": "active",
    "rotation_strategy": "pest"
  }
}
DELETE /rotation/plans/{id}
Authorization: Bearer <token>
{
  "success": true,
  "message": "Rotation plan deleted successfully",
  "data": {
    "message": "Rotation plan archived"
  }
}
POST /rotation/plans/{planId}/recommendations
Authorization: Bearer <token>
{
  "success": true,
  "message": "Recommendations generated successfully",
  "data": [
    {
      "crop": {
        "id": 2,
        "name": "Soybean",
        "family": "Fabaceae"
      },
      "reason": "Excellent for nitrogen fixation",
      "score": 9.2,
      "expected_yield": 42
    },
    {
      "crop": {
        "id": 3,
        "name": "Wheat", 
        "family": "Poaceae"
      },
      "reason": "Good seasonal match",
      "score": 7.8,
      "expected_yield": 38
    }
  ]
}
GET /health
{
  "status": "healthy",
  "service": "Smart Crop Rotation Management System",
  "timestamp": "2024-12-09T14:30:00.000Z",
  "version": "1.0.0"
}
{
  "success": false,
  "message": "Validation error: Email is required"
}
{
  "success": false, 
  "message": "No token provided"
}
{
  "success": false,
  "message": "Access denied. Admin role required."
}
{
  "success": false,
  "message": "Crop not found"
}
{
  "success": false,
  "message": "Crop with this name already exists"
}
{
  "success": false,
  "message": "Something went wrong!"
}
Authorization: Bearer <your_jwt_token>
GET /crops?page=1&limit=10
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"test@farm.com","password":"password123"}'
  curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@farm.com","password":"password123"}'
  curl -X GET http://localhost:3000/api/v1/crops \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
  curl -X POST http://localhost:3000/api/v1/rotation/plans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"field_id":"field1","field_size":5,"rotation_strategy":"nutrient"}'
  