const { validationResult, body } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const multer = require('multer');
const { postImageStorage, cloudinary } = require('../config/cloudinary');

// Multer with Cloudinary storage
const upload = multer({
    storage: postImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Validation rules
const createPostValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters'),
    body('category')
        .optional()
        .isIn([
            'Technology',
            'Lifestyle',
            'Travel',
            'Food',
            'Health',
            'Business',
            'Education',
            'Other',
        ])
        .withMessage('Invalid category'),
];

const updatePostValidation = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('content')
        .optional()
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters'),
    body('category')
        .optional()
        .isIn([
            'Technology',
            'Lifestyle',
            'Travel',
            'Food',
            'Health',
            'Business',
            'Education',
            'Other',
        ])
        .withMessage('Invalid category'),
];

// @desc    Get all posts (with pagination, search, filter)
// @route   GET /api/posts
const getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        const filter = { isPublished: true };

        if (req.query.category && req.query.category !== 'All') {
            filter.category = req.query.category;
        }

        if (req.query.author) {
            filter.author = req.query.author;
        }

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [{ title: searchRegex }, { content: searchRegex }];
        }

        const totalPosts = await Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await Post.find(filter)
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            posts,
            totalPosts,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single post
// @route   GET /api/posts/:id
const getPost = async (req, res, next) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        ).populate('author', 'username avatar bio');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a post
// @route   POST /api/posts
const createPost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { title, content, category, tags, isPublished } = req.body;

        const postData = {
            title,
            content,
            category: category || 'Other',
            author: req.user.id,
            isPublished: isPublished !== undefined ? isPublished : true,
        };

        if (tags) {
            postData.tags = typeof tags === 'string'
                ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
                : tags;
        }

        // Cloudinary URL from multer-storage-cloudinary
        if (req.file) {
            postData.coverImage = req.file.path;
        }

        const post = await Post.create(postData);
        const populatedPost = await Post.findById(post._id).populate(
            'author',
            'username avatar'
        );

        res.status(201).json(populatedPost);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
const updatePost = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (
            post.author.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        const { title, content, category, tags, isPublished } = req.body;

        if (title) post.title = title;
        if (content) {
            post.content = content;
            post.excerpt = content.substring(0, 200).replace(/\s+/g, ' ').trim();
        }
        if (category) post.category = category;
        if (isPublished !== undefined) post.isPublished = isPublished;

        if (tags) {
            post.tags = typeof tags === 'string'
                ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
                : tags;
        }

        // Cloudinary URL from multer-storage-cloudinary
        if (req.file) {
            // Delete old image from Cloudinary if it exists
            if (post.coverImage && post.coverImage.includes('cloudinary')) {
                const publicId = post.coverImage.split('/').slice(-2).join('/').split('.')[0];
                try { await cloudinary.uploader.destroy(publicId); } catch (e) { /* ignore */ }
            }
            post.coverImage = req.file.path;
        }

        const updatedPost = await post.save();
        const populatedPost = await Post.findById(updatedPost._id).populate(
            'author',
            'username avatar'
        );

        res.json(populatedPost);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (
            post.author.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // Delete cover image from Cloudinary
        if (post.coverImage && post.coverImage.includes('cloudinary')) {
            const publicId = post.coverImage.split('/').slice(-2).join('/').split('.')[0];
            try { await cloudinary.uploader.destroy(publicId); } catch (e) { /* ignore */ }
        }

        await Comment.deleteMany({ post: post._id });
        await Post.findByIdAndDelete(post._id);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
const toggleLike = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user.id;
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();

        res.json({
            likes: post.likes,
            likeCount: post.likes.length,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    upload,
    createPostValidation,
    updatePostValidation,
};
