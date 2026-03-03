const request = require('supertest');
const app = require('../../backend/app');

describe('Order API Integration Tests', () => {

    let userToken;
    let productId;

    beforeAll(async () => {
        // Register a user
        const userRes = await request(app)
            .post('/api/v1/register')
            .send({
                name: 'Order User',
                email: 'order.test@example.com',
                password: 'password123'
            });

        userToken = userRes.body.token;

        // Register Admin to create a product for an order
        const adminRes = await request(app)
            .post('/api/v1/register')
            .send({
                name: 'Admin Order',
                email: 'admin.order@example.com',
                password: 'password123'
            });

        const User = require('../../backend/models/userModel');
        await User.findOneAndUpdate({ email: 'admin.order@example.com' }, { role: 'admin' });

        const loginRes = await request(app)
            .post('/api/v1/login')
            .send({ email: 'admin.order@example.com', password: 'password123' });

        const adminToken = loginRes.body.token;

        // Create product
        const productRes = await request(app)
            .post('/api/v1/admin/product/new')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                name: 'Order Test Product',
                price: 500,
                description: 'For testing orders',
                category: 'Electronics',
                Stock: 50,
                images: ["img"]
            });

        if (productRes.body.product) {
            productId = productRes.body.product._id;
        }
    });

    it('1. Should create a new order', async () => {
        if (!productId) return;

        const res = await request(app)
            .post('/api/v1/order/new')
            .set('Cookie', [`token=${userToken}`])
            .send({
                shippingInfo: {
                    address: "Test Address",
                    city: "Test City",
                    state: "Test State",
                    country: "India",
                    pinCode: 123456,
                    phoneNo: 1234567890
                },
                orderItems: [
                    {
                        name: "Order Test Product",
                        price: 500,
                        quantity: 1,
                        image: "img",
                        product: productId
                    }
                ],
                paymentInfo: {
                    id: "razorpay_mocked_id",
                    status: "succeeded"
                },
                itemsPrice: 500,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: 500
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.order).toHaveProperty('_id');
    });

    it('2. Should not allow creating an order without mandatory fields', async () => {
        const res = await request(app)
            .post('/api/v1/order/new')
            .set('Cookie', [`token=${userToken}`])
            .send({}); // Empty body

        expect(res.statusCode).not.toEqual(201);
        expect(res.body.success).toBe(false);
    });

    it('3. Should get my orders', async () => {
        const res = await request(app)
            .get('/api/v1/orders/me')
            .set('Cookie', [`token=${userToken}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.orders)).toBe(true);
        // If order creation succeeded above, should have > 0
    });

});