const request = require('supertest');
const app = require('../../backend/app');
const User = require('../../backend/models/userModel');

describe('Auth API Integration Tests', () => {

    const testUser = {
        name: 'Test User',
        email: 'testauth@example.com',
        password: 'password123',
        gender: 'male',
        mobileNumber: '1234567890',
        avatar: 'test-avatar-url'
    };

    let token;

    it('1. Should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/register')
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.user).toHaveProperty('_id');
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.token).toBeDefined();

        token = res.body.token; // Save for later tests
    });

    it('2. Should not register a user with duplicate email', async () => {
        // Create first user
        await request(app).post('/api/v1/register').send(testUser);

        // Try to create same user again
        const res = await request(app)
            .post('/api/v1/register')
            .send(testUser);

        expect(res.statusCode).not.toEqual(201);
        expect(res.body.success).toBe(false);
    });

    it('3. Should login the user', async () => {
        // Register first
        await request(app).post('/api/v1/register').send(testUser);

        const res = await request(app)
            .post('/api/v1/login')
            .send({
                login: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
    });

    it('4. Should fail to login with invalid password', async () => {
        // Register first
        await request(app).post('/api/v1/register').send(testUser);

        const res = await request(app)
            .post('/api/v1/login')
            .send({
                login: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
    });

    it('5. Should fail to login with invalid email', async () => {
        // No registration needed as we want to fail login for non-existent user
        const res = await request(app)
            .post('/api/v1/login')
            .send({
                login: 'wrongemail@example.com',
                password: testUser.password
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
    });

    it('6. Token validation - Should get user details (me) with valid token', async () => {
        // Register and Login to get token
        await request(app).post('/api/v1/register').send(testUser);
        const loginRes = await request(app)
            .post('/api/v1/login')
            .send({
                login: testUser.email,
                password: testUser.password
            });

        const validToken = loginRes.body.token;

        const res = await request(app)
            .get('/api/v1/me')
            .set('Cookie', [`token=${validToken}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe(testUser.email);
    });

    it('7. Token validation - Should fail get user details with invalid token', async () => {
        const res = await request(app)
            .get('/api/v1/me')
            .set('Cookie', [`token=invalid-token-here`]);

        expect(res.statusCode).toEqual(401); // Unauthorized
        expect(res.body.success).toBe(false);
    });
});
