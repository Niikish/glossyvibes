const axios = require('axios');

// Replace with your actual coupon code
const couponCode = 'WELCOME10';

async function testCouponRedemption() {
    try {
        console.log(`Testing redemption of coupon: ${couponCode}`);
        
        const response = await axios.post('http://localhost:4000/api/v1/coupon/redeem', {
            code: couponCode
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('API response:', response.data);
        
        if (response.data.success) {
            console.log(`✅ Success! Coupon usage count is now: ${response.data.usageCount}`);
        } else {
            console.log('❌ Failed to redeem coupon.');
        }
    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
}

// Run the test
testCouponRedemption(); 