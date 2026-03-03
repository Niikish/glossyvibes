const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const errorMiddleware = require('./middlewares/error');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

// HTTP Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Trust proxy for rate limiter when behind a reverse proxy (like webpack dev server)
app.set('trust proxy', 1);

// config
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'backend/config/config.env' });
}

// ─── Security Middleware ───────────────────────────────────────────────
// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — allow configured frontend origin
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

// Rate limiting — general
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Reduced from 300 to 100 for strictness per user request
    message: { success: false, message: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    // STABLE-001: Skip rate limiting for read-only catalog routes to prevent 429 loops
    // Also skip in test environment
    skip: (req) => {
        if (process.env.NODE_ENV === 'test') return true;
        return (
            (req.originalUrl.startsWith('/api/v1/products') && req.method === 'GET') ||
            (req.originalUrl.startsWith('/api/v1/categories') && req.method === 'GET')
        );
    }
});
app.use('/api/', generalLimiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/v1/login', authLimiter);
app.use('/api/v1/register', authLimiter);
app.use('/api/v1/password/forgot', authLimiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// ─── Routes ───────────────────────────────────────────────────────────
const user = require('./routes/userRoute');
const product = require('./routes/productRoute');
const order = require('./routes/orderRoute');
const payment = require('./routes/paymentRoute');
const brand = require('./routes/brandRoute');
const category = require('./routes/categoryRoute');
const admin = require('./routes/adminRoute');
const location = require('./routes/locationRoute');

app.use('/api/v1', user);
app.use('/api/v1', product);
app.use('/api/v1', order);
app.use('/api/v1', payment);
app.use('/api/v1', brand);
app.use('/api/v1', category);
const coupon = require('./routes/couponRoutes');
app.use('/api', coupon);
app.use('/api/v1', admin);
app.use('/api/v1', location);

// ─── Error Middleware ──────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;