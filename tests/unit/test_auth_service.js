// tests/unit/test_auth_service.js
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const authService = require('../../src/services/authService');

describe('Auth Service Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/crop_rotation_test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('register', () => {
    test('should register new user successfully', async () => {
      const userData = {
        name: 'Test Farmer',
        email: 'farmer@test.com',
        password: 'password123',
        role: 'farmer',
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.name).toBe('Test Farmer');
      expect(result.user.email).toBe('farmer@test.com');
      expect(result.user.role).toBe('farmer');
    });

    test('should throw error for duplicate email', async () => {
      const userData = {
        name: 'Test Farmer',
        email: 'duplicate@test.com',
        password: 'password123',
      };

      await authService.register(userData);
      
      await expect(authService.register(userData))
        .rejects
        .toThrow('Email already registered');
    });
  });

  describe('login', () => {
    test('should login user successfully', async () => {
      // First register a user
      const userData = {
        name: 'Test Farmer',
        email: 'login@test.com',
        password: 'password123',
      };

      await authService.register(userData);

      // Then login
      const result = await authService.login('login@test.com', 'password123');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('login@test.com');
    });

    test('should throw error for invalid credentials', async () => {
      await expect(authService.login('nonexistent@test.com', 'wrongpass'))
        .rejects
        .toThrow('Invalid credentials');
    });
  });
});