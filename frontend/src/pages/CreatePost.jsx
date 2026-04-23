import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';

const categories = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Other'];

export default function CreatePost() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        content: '',
        category: 'Other',
        tags: '',
        isPublished: true,
    });
    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
            }
            setCoverImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.content.trim()) errs.content = 'Content is required';
        else if (form.content.length < 50) errs.content = 'Content must be at least 50 characters';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('content', form.content);
            formData.append('category', form.category);
            formData.append('tags', form.tags);
            formData.append('isPublished', form.isPublished);
            if (coverImage) formData.append('coverImage', coverImage);

            const { data } = await API.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success(form.isPublished ? 'Post published!' : 'Draft saved!');
            navigate(`/post/${data._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">Create Post</h1>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        {showPreview ? 'Edit' : 'Preview'}
                    </button>
                </div>

                {showPreview ? (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        {preview && <img src={preview} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />}
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">{form.category}</span>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">{form.title || 'Untitled Post'}</h2>
                        {form.tags && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {form.tags.split(',').map((tag, i) => tag.trim() && (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag.trim()}</span>
                                ))}
                            </div>
                        )}
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{form.content || 'No content yet...'}</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Enter your post title"
                                maxLength={150}
                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
                            />
                            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                        </div>

                        {/* Category + Tags Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                                <input
                                    name="tags"
                                    value={form.tags}
                                    onChange={handleChange}
                                    placeholder="react, javascript, web"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                                {preview ? (
                                    <div className="relative">
                                        <img src={preview} alt="" className="w-full h-48 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => { setCoverImage(null); setPreview(null); }}
                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block">
                                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm text-gray-500">Click to upload cover image</p>
                                        <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — Max 5MB</p>
                                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Content *</label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                placeholder="Write your post content here..."
                                rows={16}
                                className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y transition-all min-h-[400px] ${errors.content ? 'border-red-300' : 'border-gray-200'}`}
                            />
                            <div className="flex justify-between mt-1">
                                {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
                                <p className={`text-xs ml-auto ${form.content.length < 50 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    {form.content.length} Characters {form.content.length < 50 ? `(${50 - form.content.length} more needed)` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Publish Toggle + Submit */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-500 transition-colors" />
                                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {form.isPublished ? 'Publish' : 'Save as Draft'}
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : form.isPublished ? (
                                    'Publish Post'
                                ) : (
                                    'Save Draft'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
