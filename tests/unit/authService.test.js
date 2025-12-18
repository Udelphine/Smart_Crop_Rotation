// tests/unit/authService.test.js
const authService = require('../../src/services/authService');
const User = require('../../src/models/User');

jest.mock('../../src/models/User');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user with name identifier', async () => {
      const mockUser = {
        id: 1,
        name: 'alice',
        email: null,
        getProfile: () => ({ id: 1, name: 'alice', email: null }),
      };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const result = await authService.register({ name: 'alice', password: 'pass123' });

      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('alice');
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'alice', password: 'pass123' })
      );
    });

    it('should register user with email identifier', async () => {
      const mockUser = {
        id: 2,
        name: 'bob',
        email: 'bob@example.com',
        getProfile: () => ({ id: 2, name: 'bob', email: 'bob@example.com' }),
      };
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const result = await authService.register({ email: 'bob@example.com', password: 'pass123' });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('bob@example.com');
    });

    it('should fail if name already registered', async () => {
      const existingUser = { id: 1, name: 'alice' };
      User.findOne.mockResolvedValue(existingUser);

      await expect(authService.register({ name: 'alice', password: 'pass123' }))
        .rejects
        .toThrow('Name already registered');
    });

    it('should fail if email already registered', async () => {
      User.findOne
        .mockResolvedValueOnce(null) // no existing by email
        .mockResolvedValueOnce(null); // no existing by name
      const existingUser = { id: 1, email: 'alice@example.com' };
      User.findOne.mockResolvedValue(existingUser);

      await expect(authService.register({ email: 'alice@example.com', password: 'pass123' }))
        .rejects
        .toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with name identifier', async () => {
      const mockUser = {
        id: 1,
        name: 'alice',
        email: null,
        last_login: null,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        getProfile: () => ({ id: 1, name: 'alice', email: null }),
      };
      User.findOne.mockResolvedValue(mockUser);

      const result = await authService.login('alice', 'pass123');

      expect(result.user).toBeDefined();
      expect(mockUser.comparePassword).toHaveBeenCalledWith('pass123');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should login with email identifier', async () => {
      const mockUser = {
        id: 2,
        name: 'bob',
        email: 'bob@example.com',
        last_login: null,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
        getProfile: () => ({ id: 2, name: 'bob', email: 'bob@example.com' }),
      };
      User.findOne.mockResolvedValue(mockUser);

      const result = await authService.login('bob@example.com', 'pass123');

      expect(result.user).toBeDefined();
    });

    it('should fail if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(authService.login('alice', 'pass123'))
        .rejects
        .toThrow('Invalid credentials');
    });

    it('should fail if password is wrong', async () => {
      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findOne.mockResolvedValue(mockUser);

      await expect(authService.login('alice', 'wrongpass'))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return decoded payload', () => {
      process.env.JWT_SECRET = 'test_secret';
      const token = authService.generateToken(123);

      const decoded = authService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(123);
    });

    it('should fail on invalid token', () => {
      process.env.JWT_SECRET = 'test_secret';

      expect(() => authService.verifyToken('invalid_token'))
        .toThrow('Invalid token');
    });
  });
});
