const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // mongodb id error
    if (err.name === "CastError") {
        const message = `Resource Not Found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400)
    }

    // mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // wrong jwt error
    if (err.name === "JsonWebTokenError") {
        const message = 'JWT Error';
        err = new ErrorHandler(message, 400);
    }

    // jwt expire error
    if (err.name === "TokenExpiredError") {
        const message = 'JWT is Expired';
        err = new ErrorHandler(message, 400);
    }

    // Log 500 errors to Winston
    if (err.statusCode >= 500) {
        const logger = require('../utils/logger');
        logger.error(`[500 Server Error] ${err.message}`, { stack: err.stack, path: req.path });
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
}