// tests/integration/api.test.js
const request = require('supertest');
const app = require('../../src/server');
const database = require('../../src/utils/database');
const User = require('../../src/models/User');
const Crop = require('../../src/models/Crop');

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure DB is connected and synced
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterEach(async () => {
    // Clear test data after each test
    try {
      await Crop.destroy({ where: {}, force: true });
      await User.destroy({ where: {}, force: true });
    } catch (err) {
      // Ignore if tables don't exist yet
    }
  });

  afterAll(async () => {
    // Close DB connection
    if (database.getSequelize()) {
      await database.getSequelize().close();
    }
  });

  describe('Auth Endpoints', () => {
    it('POST /api/v1/auth/register should create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'alice', password: 'pass123' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.name).toBe('alice');
    });

    it('POST /api/v1/auth/register with email should work', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'bob@example.com', password: 'pass123' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('bob@example.com');
    });

    it('POST /api/v1/auth/register duplicate name should fail', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'alice', password: 'pass123' })
        .expect(201);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'alice', password: 'pass456' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('POST /api/v1/auth/login with name should succeed', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'alice', password: 'pass123' })
        .expect(201);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alice', password: 'pass123' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    });

    it('POST /api/v1/auth/login with wrong password should fail', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'alice', password: 'pass123' })
        .expect(201);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alice', password: 'wrongpass' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Crop Endpoints', () => {
    it('POST /api/v1/crops should create a crop', async () => {
      const res = await request(app)
        .post('/api/v1/crops')
        .send({
          name: 'Wheat',
          family: 'Poaceae',
          acidity: 40,
          owner_email: 'alice',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toBe('Wheat');
      expect(res.body.data.acidity).toBe(40);
    });

    it('POST /api/v1/crops without name should fail', async () => {
      const res = await request(app)
        .post('/api/v1/crops')
        .send({ family: 'Poaceae', acidity: 40 })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/crops should return all crops', async () => {
      await request(app)
        .post('/api/v1/crops')
        .send({ name: 'Wheat', family: 'Poaceae', acidity: 40 })
        .expect(201);

      const res = await request(app)
        .get('/api/v1/crops')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/crops?owner=alice should filter by owner', async () => {
      await request(app)
        .post('/api/v1/crops')
        .send({ name: 'Wheat', family: 'Poaceae', owner_email: 'alice' })
        .expect(201);

      await request(app)
        .post('/api/v1/crops')
        .send({ name: 'Beans', family: 'Fabaceae', owner_email: 'bob' })
        .expect(201);

      const res = await request(app)
        .get('/api/v1/crops?owner=alice')
        .expect(200);

      expect(res.body.data.every(c => c.owner_email === 'alice')).toBe(true);
    });

    it('POST /api/v1/crops duplicate name should fail', async () => {
      await request(app)
        .post('/api/v1/crops')
        .send({ name: 'Wheat', family: 'Poaceae' })
        .expect(201);

      const res = await request(app)
        .post('/api/v1/crops')
        .send({ name: 'Wheat', family: 'Poaceae' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('Soil Endpoints', () => {
    it('GET /api/v1/soil should return current soil HP', async () => {
      const res = await request(app)
        .get('/api/v1/soil')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('hp');
    });

    it('POST /api/v1/soil should set soil HP', async () => {
      const res = await request(app)
        .post('/api/v1/soil')
        .send({ hp: 65 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.hp).toBe(65);
    });

    it('GET /api/v1/rotation/check should check crop acidity', async () => {
      await request(app)
        .post('/api/v1/soil')
        .send({ hp: 50 })
        .expect(200);

      const res = await request(app)
        .get('/api/v1/rotation/check?acidity=45')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.match).toBe(true);
      expect(res.body.data.acidity).toBe(45);
      expect(res.body.data.soilHP).toBe(50);
    });

    it('GET /api/v1/rotation/check with higher acidity should not match', async () => {
      await request(app)
        .post('/api/v1/soil')
        .send({ hp: 50 })
        .expect(200);

      const res = await request(app)
        .get('/api/v1/rotation/check?acidity=55')
        .expect(200);

      expect(res.body.data.match).toBe(false);
    });
  });

  describe('Health & Root Endpoints', () => {
    it('GET /api/v1/health should return healthy status', async () => {
      const res = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBeDefined();
    });

    it('GET /api/v1 should return API info', async () => {
      const res = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('GET /api/v1/nonexistent should return 404', async () => {
      const res = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/soil without body should fail', async () => {
      const res = await request(app)
        .post('/api/v1/soil')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
