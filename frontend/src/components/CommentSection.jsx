import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function CommentSection({ postId, comments, setComments }) {
    const { user, isAuthenticated } = useAuth();
    const [content, setContent] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await API.post(`/comments/${postId}`, { content });
            setComments([...comments, { ...data, replies: [] }]);
            setContent('');
            toast.success('Comment added!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (e, parentId) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await API.post(`/comments/${postId}`, {
                content: replyContent,
                parentComment: parentId,
            });
            setComments(
                comments.map((c) =>
                    c._id === parentId
                        ? { ...c, replies: [...(c.replies || []), data] }
                        : c
                )
            );
            setReplyTo(null);
            setReplyContent('');
            toast.success('Reply added!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId, isReply, parentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await API.delete(`/comments/${commentId}`);
            if (isReply && parentId) {
                setComments(
                    comments.map((c) =>
                        c._id === parentId
                            ? { ...c, replies: c.replies.filter((r) => r._id !== commentId) }
                            : c
                    )
                );
            } else {
                setComments(comments.filter((c) => c._id !== commentId));
            }
            toast.success('Comment deleted');
        } catch (err) {
            toast.error('Failed to delete comment');
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const CommentItem = ({ comment, isReply = false, parentId = null }) => (
        <div className={`${isReply ? 'ml-8 md:ml-12' : ''}`}>
            <div className="flex gap-3 py-4">
                {comment.author?.avatar ? (
                    <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{comment.author?.username || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                        {isAuthenticated && !isReply && (
                            <button
                                onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                                className="text-xs text-gray-400 hover:text-blue-500 transition-colors font-medium"
                            >
                                Reply
                            </button>
                        )}
                        {(user?._id === comment.author?._id || user?.role === 'admin') && (
                            <button
                                onClick={() => handleDelete(comment._id, isReply, parentId)}
                                className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {replyTo === comment._id && (
                        <form onSubmit={(e) => handleReply(e, comment._id)} className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                maxLength={500}
                            />
                            <button
                                type="submit"
                                disabled={submitting || !replyContent.trim()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                Reply
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Comments ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
            </h3>

            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">{content.length}/500</span>
                        <button
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-sm"
                        >
                            {submitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-gray-50 rounded-2xl p-6 text-center mb-8">
                    <p className="text-gray-500 text-sm">
                        <Link to="/login" className="text-blue-500 font-medium hover:text-blue-600">Log in</Link> to join the conversation.
                    </p>
                </div>
            )}

            <div className="divide-y divide-gray-100">
                {comments.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id}>
                            <CommentItem comment={comment} />
                            {comment.replies?.map((reply) => (
                                <CommentItem key={reply._id} comment={reply} isReply parentId={comment._id} />
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
