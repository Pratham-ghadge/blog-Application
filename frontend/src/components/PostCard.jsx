import { Link } from 'react-router-dom';
import CategoryBadge from './CategoryBadge';

const gradients = [
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-green-400 to-teal-500',
    'from-orange-400 to-red-500',
    'from-cyan-400 to-blue-500',
    'from-pink-400 to-rose-500',
];

export default function PostCard({ post }) {
    const readTime = Math.max(1, Math.ceil((post.content?.length || 0) / 1000));
    const gradientIndex =
        post.title?.charCodeAt(0) % gradients.length || 0;

    return (
        <Link to={`/post/${post._id}`} className="group block">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                {/* Cover Image */}
                <div className="relative aspect-video overflow-hidden">
                    {post.coverImage ? (
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                            <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <CategoryBadge category={post.category} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                        {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
                        {post.excerpt || post.content?.substring(0, 150)}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                            {post.author?.avatar ? (
                                <img src={post.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                    {post.author?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-gray-700">{post.author?.username || 'Unknown'}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                            <span className="flex items-center gap-1 text-xs">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                {post.views || 0}
                            </span>
                            <span className="flex items-center gap-1 text-xs">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                {post.likeCount || post.likes?.length || 0}
                            </span>
                            <span className="text-xs">{readTime} min</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
