const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Calculate order summary
  const calculateSummary = (items, totalPrice, paymentInfo, couponDiscount) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Handle both old 'id' structure and new 'razorpay_payment_id' structure
    const paymentId = paymentInfo?.razorpay_payment_id || paymentInfo?.id || "";
    const isCOD = paymentId.toLowerCase().includes('cod');

    const codCharges = isCOD && subtotal <= 500 ? 79 : 0;
    const shipping = 0; // Free shipping
    const discount = couponDiscount || 0;
    const tax = totalPrice - subtotal + discount - shipping - codCharges;
    return { subtotal, shipping, tax, codCharges, discount };
  };

  // Prepare HTML template for order confirmation
  const orderItemsHtml = options.data?.orderItems ?
    options.data.orderItems.map(item => `
        <div style="display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: 12px; background: #faf7f2; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 14px;">
          <div style="width: 52px; height: 52px; border-radius: 8px; background: #f5e6d3; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">📦</div>
          <div style="flex: 1;">
            <div style="font-size: 14px; font-weight: 500; color: #1a1a2e; margin-bottom: 3px;">${item.name}</div>
            <div style="font-size: 12px; color: #6b7c6e;">Qty: ${item.quantity}</div>
          </div>
          <div style="font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; color: #1a1a2e; white-space: nowrap;">₹{item.price * item.quantity}</div>
        </div>
        `).join('') : '';

  const { subtotal, shipping, tax, codCharges, discount } = options.data?.orderItems ?
    calculateSummary(options.data.orderItems, options.data.totalPrice, options.data.paymentInfo, options.data.couponDiscount) :
    { subtotal: 0, shipping: 0, tax: 0, codCharges: 0, discount: 0 };

  const orderTemplate = options.data?.orderItems ? `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
</style>
</head>
<body style="background: #faf7f2; font-family: 'DM Sans', sans-serif; color: #1a1a2e; margin: 0; padding: 40px 20px;">
<div style="width: 100%; max-width: 620px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 48px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: #1a1a2e; padding: 48px 40px 40px; text-align: center;">
      <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #c9a84c; margin-bottom: 10px;">Order Confirmed</div>
      <h1 style="font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 700; color: #fff; line-height: 1.15; margin: 0;">Thank you, <em style="font-style: italic; color: #f0d98a;">${options.data.name}!</em></h1>
      <p style="margin-top: 10px; font-size: 14px; color: rgba(255,255,255,0.55); font-weight: 300;">A confirmation has been sent to ${options.email}</p>
    </div>

    <!-- Order Number Banner -->
    <div style="background: #f5e6d3; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(201,168,76,0.2);">
      <div>
        <div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #6b7c6e; font-weight: 500;">Order Number</div>
        <div style="font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.04em;">#${options.data.oid}</div>
      </div>
      <div style="font-size: 13px; color: #6b7c6e;">${new Date(options.data.paidAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>

    <!-- Body -->
    <div style="padding: 36px 40px;">
      
      <!-- Items -->
      <div style="font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 400; font-style: italic; color: #c9a84c; letter-spacing: 0.06em; margin-bottom: 16px;">Your Items</div>
      <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px;">
        ${orderItemsHtml}
      </div>

      <!-- Totals -->
      <div style="background: #faf7f2; border-radius: 14px; padding: 20px; margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #6b7c6e; padding: 6px 0;"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #6b7c6e; padding: 6px 0;"><span>Shipping</span><span>Free</span></div>
        ${codCharges > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #6b7c6e; padding: 6px 0;"><span>COD Charges</span><span>₹{codCharges}</span></div>` : ''}
        ${discount > 0 ? `<div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #388e3c; padding: 6px 0;"><span>Coupon Discount</span><span>-₹{discount}</span></div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #6b7c6e; padding: 6px 0;"><span>Tax</span><span>₹{tax}</span></div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(0,0,0,0.08); margin-top: 8px; padding-top: 14px; color: #1a1a2e; font-weight: 500; font-size: 15px;">
          <span>Total</span>
          <span style="font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #1a1a2e;">₹{options.data.totalPrice}</span>
        </div>
      </div>

      <!-- Info Grid -->
      <div style="font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 400; font-style: italic; color: #c9a84c; letter-spacing: 0.06em; margin-bottom: 16px;">Delivery & Payment</div>
      <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 28px;">
        <div style="flex: 1; min-width: 240px; background: #faf7f2; border-radius: 14px; padding: 18px; border: 1px solid rgba(0,0,0,0.04);">
          <div style="font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px;">Ship To</div>
          <div style="font-size: 13.5px; color: #1a1a2e; line-height: 1.55;">
            <strong style="display: block; font-weight: 500; margin-bottom: 2px;">${options.data.name}</strong>
            ${options.data.shippingInfo.address}<br>
            ${options.data.shippingInfo.city}, ${options.data.shippingInfo.state} ${options.data.shippingInfo.pincode}
          </div>
        </div>
        <div style="flex: 1; min-width: 240px; background: #faf7f2; border-radius: 14px; padding: 18px; border: 1px solid rgba(0,0,0,0.04);">
          <div style="font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #c9a84c; margin-bottom: 8px;">Payment</div>
          <div style="font-size: 13.5px; color: #1a1a2e; line-height: 1.55;">
            <strong style="display: block; font-weight: 500; margin-bottom: 2px;">${options.data.paymentMethod === 'COD' || options.data.paymentInfo?.id?.toLowerCase().includes('cod') ? 'Cash on Delivery' : 'Online Payment'}</strong>
            Status: ${options.data.status ? options.data.status : 'Paid'}<br>
            Payment ID: ${options.data.paymentMethod === 'COD' || options.data.paymentInfo?.id?.toLowerCase().includes('cod') ? 'Collect on Delivery' : options.data.paymentInfo?.razorpay_payment_id || options.data.paymentInfo?.id || 'N/A'}
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div style="font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 400; font-style: italic; color: #c9a84c; letter-spacing: 0.06em; margin-bottom: 16px;">Order Status</div>
      <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 28px;">
        <div style="flex: 1; text-align: center;">
            <div style="width: 28px; height: 28px; border-radius: 50%; margin: 0 auto 8px; background: #c9a84c; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px;">✓</div>
            <div style="font-size: 11px; color: #6b7c6e;"><strong>Confirmed</strong>Just now</div>
        </div>
        <div style="flex: 1; text-align: center;">
            <div style="width: 28px; height: 28px; border-radius: 50%; margin: 0 auto 8px; background: #faf7f2; border: 2px solid rgba(201,168,76,0.3); color: #6b7c6e; display: flex; align-items: center; justify-content: center; font-size: 13px;">⋯</div>
            <div style="font-size: 11px; color: #6b7c6e;"><strong>Processing</strong>1–2 days</div>
        </div>
      </div>

    </div><!-- /body -->

    <!-- Footer -->
    <div style="padding: 24px 40px; border-top: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between;">
      <div style="font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.04em;">Glossy<span>Vibes</span></div>
      <div style="font-size: 12px; color: #6b7c6e;">Thank you for shopping with us!</div>
    </div>

</div>
</body>
</html>
    ` : '';

  // Prepare HTML template for password reset
  const resetTemplate = options.data?.reset_url ? `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #faf7f2; border-radius: 24px;">
            <h2 style="font-family: 'Playfair Display', serif; color: #1a1a2e;">Password Reset</h2>
            <p style="color: #6b7c6e;">You requested to reset your password for your GlossyVibes account.</p>
            <p style="color: #6b7c6e;">Click on the button below to set a new password:</p>
            <a href="${options.data.reset_url}" style="display: inline-block; padding: 14px 40px; background: #1a1a2e; color: #fff; text-decoration: none; border-radius: 50px; font-weight: 500; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Reset Password</a>
            <p style="margin-top: 30px; color: #6b7c6e; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
    ` : '';

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject || (options.data?.orderItems ? 'Order Confirmation - GlossyVibes' : 'Password Reset - GlossyVibes'),
    html: options.html || (options.data?.orderItems ? orderTemplate : resetTemplate),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email');
  }
};

module.exports = sendEmail;