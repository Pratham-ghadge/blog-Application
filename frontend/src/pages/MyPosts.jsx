import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import CategoryBadge from '../components/CategoryBadge';
import toast from 'react-hot-toast';

export default function MyPosts() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await API.get('/posts', { params: { author: user._id, limit: 100 } });
                setPosts(data.posts);
            } catch { toast.error('Failed to fetch posts'); }
            finally { setLoading(false); }
        };
        fetchPosts();
    }, [user]);

    const handleDelete = async (id) => {
        try {
            await API.delete(`/posts/${id}`);
            setPosts(posts.filter((p) => p._id !== id));
            toast.success('Post deleted');
        } catch { toast.error('Failed to delete'); }
        setDeleteId(null);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">My Posts</h1>
                    <Link to="/create" className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md">
                        New Post
                    </Link>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 mb-4">You haven't written any posts yet.</p>
                        <Link to="/create" className="text-blue-500 font-medium hover:text-blue-600">Write your first post →</Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Post</th>
                                        <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Views</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Likes</th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {posts.map((post) => (
                                        <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link to={`/post/${post._id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors line-clamp-2">
                                                    {post.title}
                                                </Link>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(post.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell"><CategoryBadge category={post.category} /></td>
                                            <td className="px-4 py-4 text-center text-sm text-gray-500 hidden sm:table-cell">{post.views}</td>
                                            <td className="px-4 py-4 text-center text-sm text-gray-500 hidden sm:table-cell">{post.likeCount || post.likes?.length || 0}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${post.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {post.isPublished ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/edit/${post._id}`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </Link>
                                                    <button onClick={() => setDeleteId(post._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Post?</h3>
                        <p className="text-sm text-gray-500 mb-6">This action cannot be undone. All comments will also be deleted.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
