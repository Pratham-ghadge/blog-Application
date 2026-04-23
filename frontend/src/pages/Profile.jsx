import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ username: '', bio: '', currentPassword: '', newPassword: '' });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ posts: 0, likes: 0, views: 0 });

    useEffect(() => {
        if (user) {
            setForm({ username: user.username || '', bio: user.bio || '', currentPassword: '', newPassword: '' });
            if (user.avatar) setAvatarPreview(user.avatar);
        }
        fetchStats();
    }, [user]);

    const fetchStats = async () => {
        try {
            const { data } = await API.get('/posts', { params: { author: user?._id, limit: 100 } });
            const posts = data.posts || [];
            setStats({
                posts: data.totalPosts || posts.length,
                likes: posts.reduce((acc, p) => acc + (p.likeCount || p.likes?.length || 0), 0),
                views: posts.reduce((acc, p) => acc + (p.views || 0), 0),
            });
        } catch { /* ignore */ }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', form.username);
            formData.append('bio', form.bio);
            if (form.currentPassword) formData.append('currentPassword', form.currentPassword);
            if (form.newPassword) formData.append('newPassword', form.newPassword);
            if (avatar) formData.append('avatar', avatar);

            const { data } = await API.put('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            updateUser(data);
            setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Profile</h1>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Posts', value: stats.posts, icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
                        { label: 'Total Likes', value: stats.likes, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                        { label: 'Total Views', value: stats.views, icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                            <svg className="w-6 h-6 text-blue-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                            </svg>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-6">
                            <label className="cursor-pointer group relative">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="" className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-blue-100">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="hidden" />
                            </label>
                            <div>
                                <p className="font-semibold text-gray-800">{user?.username}</p>
                                <p className="text-sm text-gray-400">{user?.email}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={200}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none" />
                            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
                        </div>

                        <hr className="border-gray-100" />
                        <h3 className="text-lg font-bold text-gray-800">Change Password</h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2">
                            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</> : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
