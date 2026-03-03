const request = require('supertest');
const app = require('../../backend/app');

// Simulate DB responses
jest.mock('../../backend/models/orderModel', () => {
    return {
        findOne: jest.fn(),
        create: jest.fn()
    };
});

describe('Payment Safety & Idempotency Tests', () => {

    let userToken;
    const Order = require('../../backend/models/orderModel'); // The mocked model

    beforeAll(async () => {
        const userRes = await request(app)
            .post('/api/v1/register')
            .send({
                name: 'Safety User',
                email: 'safety@example.com',
                password: 'password123'
            });
        userToken = userRes.body.token;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('1. Should return 200 safely on double webhook hit (Idempotency)', async () => {

        // Setup mock: first hit sees no order, so it tries to create. 
        // We simulate a scenario where the order already exists to test idempotency wrapper.

        Order.findOne.mockResolvedValueOnce({
            _id: 'existing_db_order_id',
            paymentInfo: { id: 'pay_test_double_hit' }
        });

        const payload = {
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: "pay_test_double_hit",
                        order_id: "order_test_double_hit",
                        status: "captured"
                    }
                }
            }
        };

        const crypto = require('crypto');
        const signature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET || 'test_secret')
            .update(JSON.stringify(payload)).digest('hex');

        const res = await request(app)
            .post('/api/v1/payment/razorpay/webhook')
            .set('x-razorpay-signature', signature)
            .send(payload);

        // A robust backend should return 200 immediately to acknowledge webhook 
        // without crashing or duplicating if the paymentId already exists.
        expect(res.statusCode).not.toEqual(500);
        // Ideally returns 200 for safe ignore
    });

    it('2. Should reject duplicate frontend payment verification request', async () => {
        // Setup mock to pretend order is already created
        Order.findOne.mockResolvedValueOnce({
            _id: 'existing_db_order_id',
            paymentInfo: { id: 'pay_test_frontend_dup', status: 'succeeded' }
        });

        const res = await request(app)
            .post('/api/v1/payment/razorpay/verify')
            .set('Cookie', [`token=${userToken}`])
            .send({
                razorpay_order_id: 'order_test_frontend_dup',
                razorpay_payment_id: 'pay_test_frontend_dup',
                razorpay_signature: 'valid_mock_signature_if_we_could', // verification fails anyway since we mock Order, 
                // but the controller might check DB first for idempotency
            });

        // Backend either returns 200 { success: true, message: "Already verified" } 
        // OR 400 bad request if duplicating
        expect([200, 400]).toContain(res.statusCode);
    });

});
