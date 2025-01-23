import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLocationMarker } from 'react-icons/hi';

export default function LocationPermission() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-full p-8 mb-8 animate-float">
        <HiLocationMarker className="text-7xl text-white animate-pulse" />
      </div>
      
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4 animate-fade-in">Enable Location</h1>
        <p className="text-lg opacity-90 max-w-md mx-auto mb-12 animate-fade-in-delay">
          Allow BudgetBookz to access your location to find books and sellers near you
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 animate-slide-up">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-white text-blue-500 py-4 rounded-lg font-semibold 
                   hover:bg-blue-50 transition-all transform hover:scale-105"
        >
          Enable Location
        </button>
        
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-transparent text-white border border-white py-4 rounded-lg
                   hover:bg-white/10 transition-all"
        >
          Skip for now
        </button>
      </div>

      {/* Animated rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
        <div className="w-48 h-48 border-4 border-white/20 rounded-full animate-ping-slow"></div>
        <div className="absolute top-4 left-4 w-40 h-40 border-4 border-white/15 rounded-full animate-ping-slower"></div>
        <div className="absolute top-8 left-8 w-32 h-32 border-4 border-white/10 rounded-full animate-ping-slowest"></div>
      </div>
    </div>
  );
}