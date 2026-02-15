import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsTelephone } from 'react-icons/bs';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult 
} from 'firebase/auth';
import { auth } from '../config/firebase';

export default function PhoneLogin() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Initialize reCAPTCHA
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          }
        }
      );
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      
      // Add +91 for India if not present
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setShowOTP(true);
      setLoading(false);
    } catch (err: any) {
      console.error('OTP send error:', err);
      setError(err.message || 'Failed to send OTP');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error('Please request OTP first');
      }

      await confirmationResult.confirm(otp);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('OTP verify error:', err);
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <BsArrowLeft className="text-xl" />
          </button>
          <h2 className="text-2xl font-bold ml-4">Phone Login</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!showOTP ? (
          // Phone Number Form
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BsTelephone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send you a verification code
              </p>
            </div>

            <div id="recaptcha-container"></div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          // OTP Verification Form
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                OTP sent to {phoneNumber}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOTP(false);
                setOtp('');
                setError('');
              }}
              className="w-full py-2 text-blue-500 hover:text-blue-600 font-medium"
            >
              Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
