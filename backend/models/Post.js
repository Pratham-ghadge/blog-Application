const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [150, 'Title cannot exceed 150 characters'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        excerpt: {
            type: String,
            maxlength: [300, 'Excerpt cannot exceed 300 characters'],
        },
        coverImage: {
            type: String,
            default: '',
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            enum: [
                'Technology',
                'Lifestyle',
                'Travel',
                'Food',
                'Health',
                'Business',
                'Education',
                'Other',
            ],
            default: 'Other',
        },
        tags: [String],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

postSchema.virtual('likeCount').get(function () {
    return this.likes ? this.likes.length : 0;
});

postSchema.pre('save', function (next) {
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 200).replace(/\s+/g, ' ').trim();
    }
    next();
});

postSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Post', postSchema);
