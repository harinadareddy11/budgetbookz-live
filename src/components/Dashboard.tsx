import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsBook, BsArrowRepeat, BsGift, BsUpload } from 'react-icons/bs';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <button 
            className="w-full flex items-center text-left"
            onClick={() => navigate('/categories')}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <BsBook className="text-blue-500 text-xl" />
                <span className="font-semibold">Buy Books</span>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <button 
            className="w-full flex items-center text-left"
            onClick={() => navigate('/sell')}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <BsUpload className="text-green-500 text-xl" />
                <span className="font-semibold">Sell Books</span>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <button 
            className="w-full flex items-center text-left"
            onClick={() => navigate('/donate')}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <BsGift className="text-purple-500 text-xl" />
                <span className="font-semibold">Donate Books</span>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <button className="w-full flex items-center text-left">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <BsArrowRepeat className="text-blue-500 text-xl" />
                <span className="font-semibold">Exchange Books</span>
              </div>
            </div>
            <span className="text-gray-400">&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
}