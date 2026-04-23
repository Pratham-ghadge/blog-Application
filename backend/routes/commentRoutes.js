const express = require('express');
const router = express.Router();
const {
    getComments,
    createComment,
    deleteComment,
    commentValidation,
} = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

router
    .route('/:postId')
    .get(getComments)
    .post(protect, commentValidation, createComment);

router.delete('/:id', protect, deleteComment);

module.exports = router;
