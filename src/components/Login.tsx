import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsEnvelope, BsTelephone } from 'react-icons/bs';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <div className="animate-bounce-slow">
        <BsBook className="text-7xl text-white mb-6 animate-pulse" />
      </div>
      
      <div className="text-center text-white mb-12">
        <h1 className="text-4xl font-bold mb-2 animate-fade-in">Welcome to BudgetBookz</h1>
        <p className="text-xl opacity-90 animate-fade-in-delay">Learn More, Spend Less</p>
      </div>
      
      <div className="w-full max-w-md space-y-4 animate-slide-up">
        <button
          onClick={() => navigate('/email-login')}
          className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-lg
                   hover:bg-white/20 transition-all transform hover:scale-105 text-white"
        >
          <BsEnvelope className="text-xl" />
          <span className="font-semibold">Continue with Email</span>
        </button>
        
        <button
          onClick={() => navigate('/phone-login')}
          className="w-full flex items-center justify-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-lg
                   hover:bg-white/20 transition-all transform hover:scale-105 text-white"
        >
          <BsTelephone className="text-xl" />
          <span className="font-semibold">Continue with Phone</span>
        </button>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}