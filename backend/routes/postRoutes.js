const express = require('express');
const router = express.Router();
const {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    upload,
    createPostValidation,
    updatePostValidation,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router
    .route('/')
    .get(getPosts)
    .post(protect, upload.single('coverImage'), createPostValidation, createPost);

router
    .route('/:id')
    .get(getPost)
    .put(protect, upload.single('coverImage'), updatePostValidation, updatePost)
    .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);

module.exports = router;
