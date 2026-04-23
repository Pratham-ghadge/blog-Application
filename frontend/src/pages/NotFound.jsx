import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <svg className="w-32 h-32 text-gray-200 mx-auto mb-8" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="4" />
                    <text x="100" y="115" textAnchor="middle" fill="currentColor" fontSize="48" fontWeight="bold">404</text>
                </svg>
                <h1 className="text-3xl font-extrabold text-gray-800 mb-3">Page Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    Go Home
                </Link>
            </div>
        </div>
    );
}
