const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

exports.generateInvoice = async (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            // Temporary file path for the PDF
            const tempDir = path.join(__dirname, '..', 'tmp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }
            const tempFilePath = path.join(tempDir, `invoice_${order._id}.pdf`);
            const writeStream = fs.createWriteStream(tempFilePath);

            doc.pipe(writeStream);

            // Document Header
            doc.fontSize(20).text('TAX INVOICE', { align: 'center' });
            doc.moveDown();

            // Company Info
            doc.fontSize(10).text('GlossyVibes Store');
            doc.text('India');
            doc.moveDown();

            // Order Info
            doc.text(`Order ID: ${order._id}`);
            doc.text(`Date: ${new Date(order.paidAt).toLocaleDateString()}`);
            doc.text(`Payment Method: ${order.paymentMethod}`);
            doc.moveDown();

            // Shipping Info
            doc.text(`Shipping To:`);
            doc.text(order.shippingInfo.address);
            doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.pincode}`);
            doc.moveDown();

            // Items Table Header
            doc.text('Item', 50, doc.y);
            doc.text('Quantity', 250, doc.y);
            doc.text('Price', 350, doc.y);
            doc.text('Total', 450, doc.y);
            doc.moveDown();

            // Items
            order.orderItems.forEach(item => {
                const y = doc.y;
                doc.text(item.name.substring(0, 30), 50, y);
                doc.text(item.quantity.toString(), 250, y);
                doc.text(`Rs ${item.price}`, 350, y);
                doc.text(`Rs ${item.price * item.quantity}`, 450, y);
                doc.moveDown();
            });

            doc.moveDown();

            // Totals
            doc.text(`Subtotal: Rs ${order.totalPrice}`, { align: 'right' });
            if (order.couponDiscount > 0) {
                doc.text(`Discount: -Rs ${order.couponDiscount}`, { align: 'right' });
            }
            doc.fontSize(12).text(`Total Paid: Rs ${order.totalPrice}`, { align: 'right' });
            doc.fontSize(10).text('GST Included in Price', { align: 'right' });

            doc.end();

            writeStream.on('finish', async () => {
                try {
                    // Upload to Cloudinary
                    const result = await cloudinary.uploader.upload(tempFilePath, {
                        folder: 'invoices',
                        resource_type: 'raw', // Treat PDF as raw file
                    });

                    // Cleanup temp file
                    fs.unlinkSync(tempFilePath);

                    resolve(result.secure_url);
                } catch (uploadError) {
                    console.error("Cloudinary Invoice Upload Error", uploadError);
                    reject(uploadError);
                }
            });

            writeStream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};
