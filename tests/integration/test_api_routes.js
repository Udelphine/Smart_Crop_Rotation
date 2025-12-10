// tests/integration/test_api_routes.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/server');

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/crop_rotation_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Health Check Endpoint', () => {
    test('GET /api/v1/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'Smart Crop Rotation Management System');
    });
  });

  describe('Crop Endpoints', () => {
    test('GET /api/v1/crops - should return crop list', async () => {
      const response = await request(app)
        .get('/api/v1/crops');

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // Note: Authentication tests require MongoDB running
  // For now, we'll skip them if no MongoDB connection
});