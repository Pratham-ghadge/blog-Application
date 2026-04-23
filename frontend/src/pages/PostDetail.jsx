import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import CommentSection from '../components/CommentSection';
import toast from 'react-hot-toast';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [liking, setLiking] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await API.get(`/posts/${id}`);
                setPost(data);
                setLikeCount(data.likeCount || data.likes?.length || 0);
                if (user) {
                    setLiked(data.likes?.includes(user._id) || false);
                }
            } catch {
                navigate('/not-found');
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const { data } = await API.get(`/comments/${id}`);
                setComments(data);
            } catch (err) {
                console.error('Error fetching comments');
            }
        };

        fetchPost();
        fetchComments();
    }, [id, user]);

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to like posts');
            return;
        }
        setLiking(true);
        try {
            const { data } = await API.post(`/posts/${id}/like`);
            setLiked(data.likes.includes(user._id));
            setLikeCount(data.likeCount);
        } catch {
            toast.error('Failed to like post');
        } finally {
            setLiking(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const readTime = Math.max(1, Math.ceil((post?.content?.length || 0) / 1000));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="min-h-screen">
            {/* Cover Image */}
            <div className="relative h-64 md:h-96 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                {post.coverImage && (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="max-w-4xl mx-auto">
                        <CategoryBadge category={post.category} />
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-3 leading-tight">
                            {post.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile`}>
                            {post.author?.avatar ? (
                                <img src={post.author.avatar} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100" />
                            ) : (
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold ring-2 ring-blue-100">
                                    {post.author?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </Link>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">{post.author?.username}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                {' · '}{readTime} min read · {post.views} views
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLike}
                            disabled={liking}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${liked
                                    ? 'bg-red-50 border-red-200 text-red-500'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
                                }`}
                        >
                            <svg className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {likeCount}
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                        </button>
                        {user && (user._id === post.author?._id || user.role === 'admin') && (
                            <Link
                                to={`/edit/${post._id}`}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {post.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Post Content */}
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>

                {/* Author Bio Card */}
                {post.author?.bio && (
                    <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-4">
                            {post.author.avatar ? (
                                <img src={post.author.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                                    {post.author.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-gray-800">{post.author.username}</p>
                                <p className="text-sm text-gray-500 mt-1">{post.author.bio}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Comments */}
                <CommentSection postId={id} comments={comments} setComments={setComments} />
            </article>
        </div>
    );
}
