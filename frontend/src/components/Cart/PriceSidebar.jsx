import { useSelector } from 'react-redux';
import CouponInput from './CouponInput';

const PriceSidebar = ({ cartItems, paymentMethod }) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const isCOD = paymentMethod === 'cod';
    const codCharges = isCOD && subtotal <= 500 ? 79 : 0;

    const { discount } = useSelector((state) => state.coupons);
    const discountAmount = discount || 0;

    // Calculate GST components (assuming 18% GST already included)
    const preTaxAmount = +(subtotal / 1.18).toFixed(2);
    const totalGST = +(subtotal - preTaxAmount).toFixed(2);
    const sgst = +(totalGST / 2).toFixed(2);
    const cgst = +(totalGST / 2).toFixed(2);

    const totalAmount = subtotal + codCharges - discountAmount;

    return (
        <div className="flex flex-col lg:w-4/12 gap-4">


            {/* <!-- nav tiles --> */}
            <div className="flex flex-col bg-white rounded-sm shadow">
                <h1 className="px-6 py-3 border-b font-medium text-gray-500">PRICE DETAILS</h1>

                <div className="flex flex-col gap-4 p-6 pb-3">
                    <p className="flex justify-between">Price ({cartItems.length} item) <span>₹{cartItems.reduce((sum, item) => sum + (item.cuttedPrice * item.quantity), 0).toLocaleString()}</span></p>
                    <p className="flex justify-between">Discount <span className="text-primary-green">- ₹{cartItems.reduce((sum, item) => sum + ((item.cuttedPrice * item.quantity) - (item.price * item.quantity)), 0).toLocaleString()}</span></p>
                    <p className="flex justify-between">Delivery Charges <span className="text-primary-green">FREE</span></p>
                    {isCOD && (
                        <p className="flex justify-between">COD Charges {subtotal <= 500 && <span className="text-xs text-gray-500">(Orders up to ₹500)</span>} <span>₹{codCharges}</span></p>
                    )}

                    {discountAmount > 0 && (
                        <p className="flex justify-between">Coupon Discount <span className="text-primary-green">- ₹{discountAmount.toLocaleString()}</span></p>
                    )}

                    <div className="border border-dashed"></div>

                    {/* GST Information */}
                    <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-500 font-medium mb-2">Includes 18% GST</p>
                        <p className="flex justify-between text-xs text-gray-500">CGST (9%) <span>₹{cgst.toLocaleString()}</span></p>
                        <p className="flex justify-between text-xs text-gray-500">SGST (9%) <span>₹{sgst.toLocaleString()}</span></p>
                    </div>

                    <p className="flex justify-between text-lg font-medium">Total Amount <span>₹{totalAmount.toLocaleString()}</span></p>
                    <div className="border border-dashed"></div>

                    <p className="font-medium text-primary-green">You will save ₹{(cartItems.reduce((sum, item) => sum + ((item.cuttedPrice * item.quantity) - (item.price * item.quantity)), 0) + discountAmount).toLocaleString()} on this order</p>

                </div>

                {/* Coupon Input */}
                <div className="px-6 pb-4">
                    <CouponInput cartTotal={subtotal} />
                </div>

            </div>
            {/* <!-- nav tiles --> */}

        </div>
    );
};

export default PriceSidebar;
