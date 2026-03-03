const sendEmail = require('../../backend/utils/sendEmail');
const nodemailer = require('nodemailer');

describe('sendEmail', () => {
    it('should send order confirmation email with coupon details', async () => {
        const mockOptions = {
            email: 'test@test.com',
            subject: 'Order Confirmation - Flipkart',
            data: {
                name: 'Test User',
                orderItems: [{
                    name: 'Test Product',
                    price: 1000,
                    quantity: 2,
                    image: 'test.jpg'
                }],
                shippingInfo: {
                    address: 'Test Address',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456',
                    phoneNo: '1234567890'
                },
                totalPrice: 1900,
                paymentInfo: {
                    id: 'test_payment_id',
                    status: 'succeeded'
                },
                paidAt: new Date(),
                oid: 'test_order_id',
                status: 'Placed',
                couponCode: 'TEST10',
                couponDiscount: 100
            }
        };

        await sendEmail(mockOptions);

        // Verify email was sent with correct data
        const mockSendMail = nodemailer.createTransport().sendMail;
        expect(mockSendMail).toHaveBeenCalled();
        
        const emailCall = mockSendMail.mock.calls[0][0];
        expect(emailCall.to).toBe('test@test.com');
        expect(emailCall.subject).toBe('Order Confirmation - Flipkart');
        expect(emailCall.html).toContain('TEST10'); // Coupon code
        expect(emailCall.html).toContain('100'); // Coupon discount
        expect(emailCall.html).toContain('1900'); // Total price
    });

    it('should calculate correct totals with coupon discount', async () => {
        const mockOptions = {
            email: 'test@test.com',
            subject: 'Order Confirmation - Flipkart',
            data: {
                name: 'Test User',
                orderItems: [{
                    name: 'Test Product',
                    price: 1000,
                    quantity: 1,
                    image: 'test.jpg'
                }],
                shippingInfo: {
                    address: 'Test Address',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456',
                    phoneNo: '1234567890'
                },
                totalPrice: 900, // After 100 discount
                paymentInfo: {
                    id: 'test_payment_id',
                    status: 'succeeded'
                },
                paidAt: new Date(),
                oid: 'test_order_id',
                status: 'Placed',
                couponCode: 'TEST10',
                couponDiscount: 100
            }
        };

        await sendEmail(mockOptions);

        const mockSendMail = nodemailer.createTransport().sendMail;
        const emailHtml = mockSendMail.mock.calls[1][0].html;
        
        // Verify subtotal calculation
        expect(emailHtml).toContain('₹1000'); // Original price
        expect(emailHtml).toContain('-₹100'); // Discount amount
        expect(emailHtml).toContain('₹900'); // Final total
    });

    it('should handle orders without coupon', async () => {
        const mockOptions = {
            email: 'test@test.com',
            subject: 'Order Confirmation - Flipkart',
            data: {
                name: 'Test User',
                orderItems: [{
                    name: 'Test Product',
                    price: 1000,
                    quantity: 1,
                    image: 'test.jpg'
                }],
                shippingInfo: {
                    address: 'Test Address',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456',
                    phoneNo: '1234567890'
                },
                totalPrice: 1000,
                paymentInfo: {
                    id: 'test_payment_id',
                    status: 'succeeded'
                },
                paidAt: new Date(),
                oid: 'test_order_id',
                status: 'Placed'
            }
        };

        await sendEmail(mockOptions);

        const mockSendMail = nodemailer.createTransport().sendMail;
        const emailHtml = mockSendMail.mock.calls[2][0].html;
        
        // Verify no coupon information is shown
        expect(emailHtml).not.toContain('Coupon Discount');
        expect(emailHtml).not.toContain('Applied Coupon');
    });

    it('should handle COD orders with coupon', async () => {
        const mockOptions = {
            email: 'test@test.com',
            subject: 'Order Confirmation - Flipkart',
            data: {
                name: 'Test User',
                orderItems: [{
                    name: 'Test Product',
                    price: 400,
                    quantity: 1,
                    image: 'test.jpg'
                }],
                shippingInfo: {
                    address: 'Test Address',
                    city: 'Test City',
                    state: 'Test State',
                    pincode: '123456',
                    phoneNo: '1234567890'
                },
                totalPrice: 379, // 400 - 100 discount + 79 COD charges
                paymentInfo: {
                    id: 'COD',
                    status: 'pending'
                },
                paidAt: new Date(),
                oid: 'test_order_id',
                status: 'Placed',
                couponCode: 'TEST10',
                couponDiscount: 100
            }
        };

        await sendEmail(mockOptions);

        const mockSendMail = nodemailer.createTransport().sendMail;
        const emailHtml = mockSendMail.mock.calls[3][0].html;
        
        // Verify both COD charges and coupon discount are shown
        expect(emailHtml).toContain('COD Charges');
        expect(emailHtml).toContain('₹79');
        expect(emailHtml).toContain('Coupon Discount');
        expect(emailHtml).toContain('-₹100');
        expect(emailHtml).toContain('₹379'); // Final total
    });
}); 