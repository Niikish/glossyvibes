const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
require('dotenv').config();

let mongod;

// Connect to the in-memory database before running tests
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
});

// Clear all data between tests
afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

// Disconnect and stop the server after all tests
afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue({ response: 'Success' })
    })
}));

// Mock Razorpay Globally
jest.mock("razorpay", () => {
    return jest.fn().mockImplementation(() => {
        return {
            orders: {
                create: jest.fn().mockResolvedValue({
                    id: "test_order_id",
                    amount: 10000
                })
            }
        };
    });
});


// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRE = '7d';
process.env.COOKIE_EXPIRE = '5';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_SERVICE = 'test';
process.env.SMTP_MAIL = 'test@test.com';
process.env.SMTP_PASSWORD = 'test-password'; 