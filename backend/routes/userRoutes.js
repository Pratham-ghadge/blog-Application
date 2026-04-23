const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateProfile,
    avatarUpload,
    updateProfileValidation,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:id', getUserProfile);
router.put(
    '/profile',
    protect,
    avatarUpload.single('avatar'),
    updateProfileValidation,
    updateProfile
);

module.exports = router;
