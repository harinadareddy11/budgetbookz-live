import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsHouse, BsSearch, BsCart } from 'react-icons/bs';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-500 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">BudgetBookz</h1>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <nav className="bg-white border-t">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center text-blue-500"
            >
              <BsHouse className="text-xl" />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex flex-col items-center text-gray-500"
            >
              <BsSearch className="text-xl" />
              <span className="text-xs mt-1">Search</span>
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="flex flex-col items-center text-gray-500"
            >
              <BsCart className="text-xl" />
              <span className="text-xs mt-1">Cart</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}