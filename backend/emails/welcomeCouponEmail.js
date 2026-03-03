const welcomeCouponEmail = (code, expiryDate) => {
    const formattedExpiry = new Date(expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background-color: #faf7f2; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .header { background: #1a1a2e; color: #ffffff; padding: 40px 20px; text-align: center; }
        .content { padding: 40px; text-align: center; color: #1a1a2e; }
        .code-box { background: #faf7f2; border: 2px dashed #c9a84c; border-radius: 12px; padding: 25px; margin: 30px 0; position: relative; }
        .coupon-code { font-size: 32px; font-weight: 800; color: #1a1a2e; letter-spacing: 4px; display: block; }
        .discount-label { color: #c9a84c; text-transform: uppercase; font-size: 12px; font-weight: 600; letter-spacing: 2px; margin-bottom: 8px; display: block; }
        .btn { display: inline-block; padding: 18px 45px; background: #1a1a2e; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; margin-top: 20px; }
        .footer { padding: 25px; text-align: center; background: #fcfcfc; border-top: 1px solid #f0f0f0; font-size: 12px; color: #6b7c6e; }
        h1 { margin: 0; font-size: 28px; font-weight: 700; }
        p { line-height: 1.6; color: #4a4a4a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span style="color: #c9a84c; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; display: block; margin-bottom: 10px;">Welcome to GlossyVibes</span>
            <h1>A Special Gift for You</h1>
        </div>
        <div class="content">
            <p>Welcome to the community! We're excited to have you with us. As a token of our appreciation, here's a special reward for your first order.</p>
            
            <div class="code-box">
                <span class="discount-label">Your Exclusive Coupon</span>
                <span class="coupon-code">${code}</span>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 30px;">This coupon gives you <strong>₹50 OFF</strong> on your purchase.<br>Valid until: <strong>${formattedExpiry}</strong></p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="btn">Shop Now & Apply Coupon</a>
        </div>
        <div class="footer">
            <p>© 2026 GlossyVibes. All rights reserved.<br>This coupon is unique to your account and valid for one-time use only.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = welcomeCouponEmail;
