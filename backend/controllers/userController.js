const { validationResult, body } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const multer = require('multer');
const { avatarStorage, cloudinary } = require('../config/cloudinary');

// Multer with Cloudinary storage for avatars
const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

const updateProfileValidation = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Bio cannot exceed 200 characters'),
    body('newPassword')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
];

// @desc    Get user public profile
// @route   GET /api/users/:id
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select(
            'username avatar bio createdAt'
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const postCount = await Post.countDocuments({
            author: req.params.id,
            isPublished: true,
        });

        res.json({
            ...user.toObject(),
            postCount,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, bio, currentPassword, newPassword } = req.body;

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        if (newPassword) {
            if (!currentPassword) {
                return res
                    .status(400)
                    .json({ message: 'Current password is required to set a new password' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Cloudinary URL from multer-storage-cloudinary
        if (req.file) {
            // Delete old avatar from Cloudinary if it exists
            if (user.avatar && user.avatar.includes('cloudinary')) {
                const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
                try { await cloudinary.uploader.destroy(publicId); } catch (e) { /* ignore */ }
            }
            user.avatar = req.file.path;
        }

        const updatedUser = await user.save();

        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateProfile,
    avatarUpload,
    updateProfileValidation,
};
