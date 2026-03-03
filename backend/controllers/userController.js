const User = require('../models/userModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary');
const validator = require('validator');

// Register User
exports.registerUser = asyncErrorHandler(async (req, res, next) => {
    const { name, email, gender, mobileNumber, password } = req.body;

    const user = await User.create({
        name,
        email,
        gender,
        mobileNumber,
        password,
        avatar: {
            public_id: 'default_avatar_id',
            url: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        },
    });

    // Generate Welcome Coupon (Silent failure)
    const { generateWelcomeCoupon } = require('../utils/couponGenerator');
    try {
        await generateWelcomeCoupon(user._id, user.email);
    } catch (err) {
        console.error('Welcome coupon error during signup:', err);
    }

    sendToken(user, 201, res);
});

// Login User
exports.loginUser = asyncErrorHandler(async (req, res, next) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return next(new ErrorHandler('Please Enter Email/Mobile Number And Password', 400));
    }

    const isEmail = validator.isEmail(login);
    let user;

    if (isEmail) {
        user = await User.findOne({ email: login }).select('+password');
    } else {
        if (!/^\d{10}$/.test(login)) {
            return next(new ErrorHandler('Please enter a valid email or 10-digit mobile number', 400));
        }
        user = await User.findOne({ mobileNumber: login }).select('+password');
    }

    if (!user) {
        return next(new ErrorHandler('Invalid Email/Mobile Number or Password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email/Mobile Number or Password', 401));
    }

    // BUG-009 FIX: login should return 200, not 201
    sendToken(user, 200, res);
});

// Logout User
exports.logoutUser = asyncErrorHandler(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Logged Out' });
});

// Get User Details
exports.getUserDetails = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
});

// Forgot Password
exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler('User Not Found', 404));
    }

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${process.env.FRONTEND_URL || `https://${req.get('host')}`}/password/reset/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            templateId: process.env.SENDGRID_RESET_TEMPLATEID,
            data: { reset_url: resetPasswordUrl },
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500));
    }
});

// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler('Reset password token is invalid or has expired', 404));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
});

// Update Password
exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Old Password is Invalid', 400));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
});

// Update User Profile
exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
    };

    if (req.body.avatar && req.body.avatar !== '') {
        const user = await User.findById(req.user.id);
        // Only destroy if it's not the default avatar
        if (user.avatar.public_id && user.avatar.public_id !== 'default_avatar_id') {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        }
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: 'scale',
        });
        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    await User.findByIdAndUpdate(req.user.id, { $set: newUserData }, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true });
});

// ── ADMIN ──────────────────────────────────────────────────────────────

// Get All Users — ADMIN (with pagination)
exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(),
    ]);

    res.status(200).json({
        success: true,
        users,
        totalUsers,
        page,
        totalPages: Math.ceil(totalUsers / limit),
    });
});

// Get Single User Details — ADMIN
exports.getSingleUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, user });
});

// Update User Role — ADMIN
exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        role: req.body.role,
    };

    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, message: 'User updated successfully' });
});

// Delete User — ADMIN
exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User doesn't exist with id: ${req.params.id}`, 404));
    }
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User Deleted Successfully' });
});