const request = require('supertest');
const app = require('../../backend/app');
const Coupon = require('../../backend/models/couponModel');
const User = require('../../backend/models/userModel');

let token;
let user;

beforeEach(async () => {
    user = await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        gender: 'male',
        mobileNumber: '1234567890'
    });
    token = user.getJWTToken();
});

describe('Coupon Validation Issues', () => {
    it('should prevent multiple uses of single-use coupon', async () => {
        const coupon = await Coupon.create({
            code: 'SINGLE10',
            type: 'Percentage',
            value: 10,
            minPurchase: 100,
            maxDiscount: 100,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 86400000),
            isActive: true,
            usageLimit: 1,
            user: user._id
        });

        // First use
        const response1 = await request(app)
            .post('/api/v1/coupon/apply')
            .set('Cookie', `token=${token}`)
            .send({
                code: 'SINGLE10',
                amount: 1000
            });

        expect(response1.status).toBe(200);

        // Redeem the coupon
        await request(app)
            .post('/api/v1/coupon/redeem')
            .set('Cookie', `token=${token}`)
            .send({ code: 'SINGLE10' });

        // Second use - should fail
        const response2 = await request(app)
            .post('/api/v1/coupon/apply')
            .set('Cookie', `token=${token}`)
            .send({
                code: 'SINGLE10',
                amount: 1000
            });

        expect(response2.status).toBe(400);
    });

    it('should handle race conditions in coupon usage', async () => {
        const coupon = await Coupon.create({
            code: 'RACE10',
            type: 'Percentage',
            value: 10,
            minPurchase: 100,
            maxDiscount: 100,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 86400000),
            isActive: true,
            usageLimit: 1,
            user: user._id
        });

        // Simulate multiple simultaneous requests
        const promises = Array(5).fill().map(() =>
            request(app)
                .post('/api/v1/coupon/redeem')
                .set('Cookie', `token=${token}`)
                .send({
                    code: 'RACE10'
                })
        );

        const results = await Promise.all(promises);
        const successfulRequests = results.filter(r => r.status === 200);
        expect(successfulRequests.length).toBe(1);
    });

    it('should validate coupon expiry correctly across timezones', async () => {
        const coupon = await Coupon.create({
            code: 'TIMEZONE10',
            type: 'Percentage',
            value: 10,
            minPurchase: 100,
            maxDiscount: 100,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 3600000), // 1 hour from now
            isActive: true,
            usageLimit: 1,
            user: user._id
        });

        // Test with different timezone offset
        const originalTimezone = process.env.TZ;
        process.env.TZ = 'Asia/Tokyo';

        const response = await request(app)
            .post('/api/v1/coupon/apply')
            .set('Cookie', `token=${token}`)
            .send({
                code: 'TIMEZONE10',
                amount: 1000
            });

        process.env.TZ = originalTimezone;
        expect(response.status).toBe(200);
    });

    it('should handle decimal values in percentage discounts correctly', async () => {
        const coupon = await Coupon.create({
            code: 'DECIMAL10',
            type: 'Percentage',
            value: 10.5,
            minPurchase: 100,
            maxDiscount: 100,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 86400000),
            isActive: true,
            usageLimit: 1,
            user: user._id
        });

        const response = await request(app)
            .post('/api/v1/coupon/apply')
            .set('Cookie', `token=${token}`)
            .send({
                code: 'DECIMAL10',
                amount: 99.99
            });

        expect(response.status).toBe(400); // Should fail due to minPurchase
        expect(response.body.discount).toBeUndefined();
    });
}); 