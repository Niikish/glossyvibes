const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401));
    }

    // BUG-020 FIX: wrap jwt.verify in try/catch so malformed tokens
    // return a clean 401 instead of crashing the server
    let decodedData;
    try {
        decodedData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new ErrorHandler("Session expired. Please login again.", 401));
        }
        return next(new ErrorHandler("Invalid authentication token. Please login again.", 401));
    }

    req.user = await User.findById(decodedData.id);

    if (!req.user) {
        return next(new ErrorHandler("User not found. Please login again.", 401));
    }

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Access denied. Role '${req.user.role}' is not authorized.`, 403));
        }
        next();
    };
};