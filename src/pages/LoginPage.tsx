import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Clear any previous errors when component mounts
    setError('');
  }, []);

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      
      // If email contains 'admin', redirect to admin dashboard
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8">
          {/* Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <Compass className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dayla
              </span>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">Welcome back! Let's plan your next adventure.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-gray-600 text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Account */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800 text-center">
              <strong>Demo Account:</strong> user@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;