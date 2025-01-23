import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsArrowLeft } from 'react-icons/bs';

export default function PhoneLogin() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    // Simulate OTP send
    setTimeout(() => {
      setIsOtpSent(true);
      setLoading(false);
      alert('For demo purposes, use OTP: 123456');
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      navigate('/dashboard');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center text-blue-500 mb-6"
        >
          <BsArrowLeft className="mr-2" /> Back
        </button>

        <BsBook className="text-5xl text-blue-500 mb-6" />
        <h1 className="text-3xl font-bold mb-2">Welcome to BudgetBookz</h1>
        <p className="text-gray-600 mb-8">Learn More, Spend Less</p>

        {!isOtpSent ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg">
                  +91
                </span>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setPhoneNumber(value);
                    }
                  }}
                  className="w-full p-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10}
              className={`w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors ${
                (loading || phoneNumber.length !== 10) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-gray-700 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={otp.length !== 6}
              className={`w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors ${
                otp.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Verify & Continue
            </button>
            <button
              type="button"
              onClick={() => {
                alert('For demo purposes, use OTP: 123456');
              }}
              className="w-full text-blue-500 text-sm hover:text-blue-600"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}