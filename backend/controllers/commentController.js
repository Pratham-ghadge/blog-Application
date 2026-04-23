const { validationResult, body } = require('express-validator');
const Comment = require('../models/Comment');

const commentValidation = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ max: 500 })
        .withMessage('Comment cannot exceed 500 characters'),
];

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
const getComments = async (req, res, next) => {
    try {
        const topLevelComments = await Comment.find({
            post: req.params.postId,
            parentComment: null,
        })
            .populate('author', 'username avatar')
            .sort({ createdAt: 1 });

        // Fetch replies for each top-level comment
        const commentsWithReplies = await Promise.all(
            topLevelComments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('author', 'username avatar')
                    .sort({ createdAt: 1 });
                return {
                    ...comment.toObject(),
                    replies,
                };
            })
        );

        res.json(commentsWithReplies);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a comment
// @route   POST /api/comments/:postId
const createComment = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { content, parentComment } = req.body;

        const commentData = {
            content,
            author: req.user.id,
            post: req.params.postId,
        };

        if (parentComment) {
            commentData.parentComment = parentComment;
        }

        const comment = await Comment.create(commentData);
        const populatedComment = await Comment.findById(comment._id).populate(
            'author',
            'username avatar'
        );

        res.status(201).json(populatedComment);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (
            comment.author.toString() !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res
                .status(403)
                .json({ message: 'Not authorized to delete this comment' });
        }

        // Delete all replies to this comment
        await Comment.deleteMany({ parentComment: comment._id });
        await Comment.findByIdAndDelete(comment._id);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getComments,
    createComment,
    deleteComment,
    commentValidation,
};
