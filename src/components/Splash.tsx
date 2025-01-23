import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook } from 'react-icons/bs';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/location');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex flex-col items-center justify-center text-white">
      <div className="animate-bounce-slow">
        <BsBook className="text-7xl mb-4 animate-pulse" />
      </div>
      <h1 className="text-4xl font-bold mb-2 animate-fade-in">BudgetBookz</h1>
      <p className="text-xl opacity-90 animate-fade-in-delay">Learn More, Spend Less</p>
      
      {/* Loading indicator */}
      <div className="mt-12 flex space-x-2">
        <div className="w-2 h-2 bg-white rounded-full animate-bounce-delay-1"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce-delay-2"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-bounce-delay-3"></div>
      </div>
    </div>
  );
}