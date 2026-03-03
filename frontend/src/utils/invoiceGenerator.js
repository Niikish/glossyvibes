import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from './functions';

/**
 * Generates and downloads a PDF invoice for an order
 * @param {Object} order - The order object containing all order details
 */
export const generateInvoice = (order) => {
    // Create a temporary div to render invoice content
    const invoiceContainer = document.createElement('div');
    invoiceContainer.style.padding = '30px';
    invoiceContainer.style.position = 'absolute';
    invoiceContainer.style.top = '-9999px';
    invoiceContainer.style.width = '816px'; // A4 width in pixels at 96 DPI
    invoiceContainer.style.fontFamily = 'Arial, sans-serif';

    // Calculate GST (assuming 18% is already included in the price)
    const subtotal = order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const preTaxAmount = +(subtotal / 1.18).toFixed(2);
    const totalGST = +(subtotal - preTaxAmount).toFixed(2);
    const sgst = +(totalGST / 2).toFixed(2);
    const cgst = +(totalGST / 2).toFixed(2);

    // Company logo and info
    invoiceContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="max-width: 300px;">
                <h1 style="margin: 0; color: #6366f1; font-size: 28px;">GlossyVibes</h1>
                <p style="margin: 5px 0; color: #666;">123 Beauty Lane</p>
                <p style="margin: 5px 0; color: #666;">New Delhi, 110001</p>
                <p style="margin: 5px 0; color: #666;">contact@glossyvibes.com</p>
                <p style="margin: 5px 0; color: #666;">GSTIN: 29AABCT1332L1ZB</p>
            </div>
            <div style="text-align: right;">
                <h2 style="margin: 0; font-size: 24px; color: #333;">INVOICE</h2>
                <p style="margin: 5px 0; color: #666;">#INV-${order._id.substring(0, 8)}</p>
                <p style="margin: 5px 0; color: #666;">Date: ${formatDate(order.createdAt)}</p>
                <p style="margin: 5px 0; color: #666; background: ${order.orderStatus === "Delivered" ? "#d1fae5" :
            order.orderStatus === "Shipped" ? "#dbeafe" : "#fef3c7"
        }; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                    Status: ${order.orderStatus}
                </p>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div style="width: 45%;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #6366f1;">Bill To:</h3>
                <p style="margin: 5px 0; font-weight: bold; color: #333;">${order.user.name}</p>
                <p style="margin: 5px 0; color: #666;">${order.shippingInfo.address}</p>
                <p style="margin: 5px 0; color: #666;">${order.shippingInfo.city}, ${order.shippingInfo.state} ${order.shippingInfo.pincode}</p>
                <p style="margin: 5px 0; color: #666;">${order.shippingInfo.country}</p>
                <p style="margin: 5px 0; color: #666;">Phone: ${order.shippingInfo.phoneNo}</p>
                <p style="margin: 5px 0; color: #666;">Email: ${order.user.email}</p>
            </div>
            <div style="width: 45%;">
                <h3 style="margin: 0 0 10px; font-size: 16px; color: #6366f1;">Payment Information:</h3>
                <p style="margin: 5px 0; color: #666;">Method: ${order.paymentInfo.id.toLowerCase().includes('cod')
            ? 'Cash on Delivery'
            : 'Online Payment'
        }</p>
                <p style="margin: 5px 0; color: #666;">ID: ${order.paymentInfo.id}</p>
                <p style="margin: 5px 0; color: #666;">Status: ${order.paymentInfo.status}</p>
                ${order.paidAt ? `<p style="margin: 5px 0; color: #666;">Paid on: ${formatDate(order.paidAt)}</p>` : ''}
            </div>
        </div>
        
        <div style="margin-bottom: 15px;">
            <div style="background-color: #f3f4f6; padding: 8px; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #666; font-style: italic;">
                    <strong>Price Details:</strong> All prices are inclusive of GST at 18% (CGST: 9%, SGST: 9%)
                </p>
            </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
                <tr style="background-color: #f3f4f6;">
                    <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb;">Item</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">Qty</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">Base Price</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">CGST (9%)</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">SGST (9%)</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">Price (Incl.)</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.orderItems.map(item => {
            const basePrice = +(item.price / 1.18).toFixed(2);
            const itemGST = +(item.price - basePrice).toFixed(2);
            const itemCGST = +(itemGST / 2).toFixed(2);
            const itemSGST = +(itemGST / 2).toFixed(2);

            return `
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                            <div style="display: flex; align-items: center;">
                                <div style="width: 40px; height: 40px; overflow: hidden; margin-right: 10px;">
                                    <img src="${item.image}" alt="${item.name}" style="width: 100%; height: auto; object-fit: contain;" />
                                </div>
                                <div>${item.name}</div>
                            </div>
                        </td>
                        <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                        <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">₹{basePrice.toLocaleString()}</td>
                        <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">₹{itemCGST.toLocaleString()}</td>
                        <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">₹{itemSGST.toLocaleString()}</td>
                        <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">₹{item.price.toLocaleString()}</td>
                        <td style="text-align: right; padding: 12px; border-bottom: 1px solid #e5e7eb;">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                    `;
        }).join('')}
            </tbody>
        </table>
        
        <div style="display: flex; justify-content: flex-end;">
            <div style="width: 300px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #666;">Amount (Excl. Tax):</span>
                    <span>₹{preTaxAmount.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #666;">CGST @ 9%:</span>
                    <span>₹{cgst.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #666;">SGST @ 9%:</span>
                    <span>₹{sgst.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #666;">Shipping:</span>
                    <span>Free</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold;">
                    <span style="font-size: 18px;">Total:</span>
                    <span style="font-size: 18px; color: #6366f1;">₹{order.totalPrice.toLocaleString()}</span>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb; max-width: 100%;">
            <h3 style="margin: 0 0 10px; font-size: 16px; color: #6366f1;">Tax Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                        <th style="text-align: left; padding: 8px; font-size: 14px; color: #666;">Description</th>
                        <th style="text-align: right; padding: 8px; font-size: 14px; color: #666;">Taxable Amount</th>
                        <th style="text-align: right; padding: 8px; font-size: 14px; color: #666;">CGST</th>
                        <th style="text-align: right; padding: 8px; font-size: 14px; color: #666;">SGST</th>
                        <th style="text-align: right; padding: 8px; font-size: 14px; color: #666;">Total Tax</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left; padding: 8px; font-size: 14px;">GST 18%</td>
                        <td style="text-align: right; padding: 8px; font-size: 14px;">₹{preTaxAmount.toLocaleString()}</td>
                        <td style="text-align: right; padding: 8px; font-size: 14px;">₹{cgst.toLocaleString()}</td>
                        <td style="text-align: right; padding: 8px; font-size: 14px;">₹{sgst.toLocaleString()}</td>
                        <td style="text-align: right; padding: 8px; font-size: 14px;">₹{totalGST.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            <p style="margin: 10px 0 0; font-size: 12px; color: #666; font-style: italic;">Note: All prices are inclusive of GST at 18% (CGST: 9%, SGST: 9%)</p>
        </div>
        
        <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #666;">
            <p style="margin: 5px 0;">Thank you for shopping with GlossyVibes!</p>
            <p style="margin: 5px 0;">If you have any questions, please contact our customer support at support@glossyvibes.com</p>
        </div>
    `;

    document.body.appendChild(invoiceContainer);

    // Generate PDF from the temporary div
    html2canvas(invoiceContainer, { scale: 2 }).then(canvas => {
        document.body.removeChild(invoiceContainer);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`GlossyVibes_Invoice_${order._id.substring(0, 8)}.pdf`);
    });
}; 