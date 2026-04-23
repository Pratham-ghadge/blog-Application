import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../api/axios';
import PostCard from '../components/PostCard';
import SearchBar from '../components/SearchBar';
import CategoryBadge from '../components/CategoryBadge';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const categories = ['All', 'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Other'];

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="aspect-video skeleton" />
            <div className="p-5 space-y-3">
                <div className="h-5 skeleton rounded w-3/4" />
                <div className="h-4 skeleton rounded w-full" />
                <div className="h-4 skeleton rounded w-2/3" />
                <div className="flex justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 skeleton rounded-full" />
                        <div className="h-3 skeleton rounded w-20" />
                    </div>
                    <div className="h-3 skeleton rounded w-16" />
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [search, setSearch] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const params = { page: currentPage, limit: 9 };
                if (selectedCategory !== 'All') params.category = selectedCategory;
                if (search) params.search = search;

                const { data } = await API.get('/posts', { params });
                setPosts(data.posts);
                setTotalPages(data.totalPages);
            } catch (err) {
                console.error('Error fetching posts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [currentPage, selectedCategory, search]);

    useEffect(() => {
        const params = {};
        if (currentPage > 1) params.page = currentPage;
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (search) params.search = search;
        setSearchParams(params);
    }, [currentPage, selectedCategory, search]);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
    };

    const handleSearch = (query) => {
        setSearch(query);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Share Your
                            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                                Story
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            A modern platform for writers, thinkers, and creators. Write, share, and discover stories that matter.
                        </p>
                        {isAuthenticated ? (
                            <Link
                                to="/create"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Start Writing
                            </Link>
                        ) : (
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 rounded-2xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                            >
                                Get Started
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Search */}
                <div className="mb-8">
                    <SearchBar onSearch={handleSearch} initialValue={search} />
                </div>

                {/* Category Filters */}
                <div className="mb-8 flex flex-wrap gap-2 justify-center">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No posts found</h3>
                        <p className="text-gray-500 mb-6">Be the first to write one!</p>
                        {isAuthenticated && (
                            <Link
                                to="/create"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                                Write a Post
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </section>
        </div>
    );
}
