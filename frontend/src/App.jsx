import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyPosts from './pages/MyPosts';
import NotFound from './pages/NotFound';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
                    <Navbar />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/post/:id" element={<PostDetail />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
                            <Route path="/edit/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: { borderRadius: '12px', padding: '12px 16px', fontSize: '14px' },
                        success: { iconTheme: { primary: '#3B82F6', secondary: '#fff' } },
                    }}
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
