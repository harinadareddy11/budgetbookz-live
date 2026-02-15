import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsEnvelope, BsTelephone, BsGoogle, BsArrowLeft } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <BsBook className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Budget Bookz</h1>
          <p className="text-gray-600">Welcome back! Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Sign-in Options */}
        <div className="space-y-4">
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <BsGoogle className="text-2xl text-red-500" />
            <span className="font-semibold text-gray-700">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Email Login */}
          <button
            onClick={() => navigate('/email-login')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
          >
            <BsEnvelope className="text-2xl" />
            <span className="font-semibold">Continue with Email</span>
          </button>

          {/* Phone Login */}
          <button
            onClick={() => navigate('/phone-login')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50"
          >
            <BsTelephone className="text-2xl" />
            <span className="font-semibold">Continue with Phone</span>
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-8 leading-relaxed">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">Privacy Policy</a>
        </p>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 font-semibold text-sm transition-colors"
          >
            <BsArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
