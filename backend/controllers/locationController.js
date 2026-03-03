const Location = require('../models/Location');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');

// Get City and State by Pincode => /api/v1/location/pincode/:pincode
exports.getLocationByPincode = catchAsyncErrors(async (req, res, next) => {
    const { pincode } = req.params;

    // 1. Validate pincode format
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
        return next(new ErrorHandler("Invalid PIN code format. Must be 6 digits.", 400));
    }

    // 2. Check if pincode exists in DB cache
    let location = await Location.findOne({ pincode });

    if (location) {
        return res.status(200).json({
            success: true,
            pincode: location.pincode,
            city: location.city,
            state: location.state,
            cached: true
        });
    }

    // 3. Fallback to external API (India Post API)
    try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);

        if (!response.ok) {
            return next(new ErrorHandler("Failed to reach location service", 503));
        }

        const data = await response.json();

        // 4. Validate API response
        if (!data || !data[0] || data[0].Status !== "Success" || !data[0].PostOffice || data[0].PostOffice.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Invalid or not serviceable pincode"
            });
        }

        // Extract City (District) and State
        const postOffice = data[0].PostOffice[0];
        const city = postOffice.District || postOffice.Block || postOffice.Name;
        const state = postOffice.State;

        if (!city || !state) {
            return next(new ErrorHandler("Incomplete location data from service", 502));
        }

        // 5. Save to DB cache
        location = await Location.create({
            pincode,
            city,
            state
        });

        // 6. Return response
        res.status(200).json({
            success: true,
            pincode: location.pincode,
            city: location.city,
            state: location.state,
            cached: false
        });

    } catch (error) {
        console.error("Pincode API Error:", error);
        return next(new ErrorHandler("Location service is temporarily unavailable", 500));
    }
});
