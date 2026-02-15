import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsArrowLeft, BsPersonCircle, BsGrid, BsBox, BsHeart, BsChatDots, BsBoxArrowRight, BsBook } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showProfile?: boolean;
}

export default function Header({ title, showBack = false, showProfile = false }: HeaderProps) {
  const navigate = useNavigate();
  const { currentUser, userData, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-blue-600 shadow-lg px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Back Button or BudgetBookz Logo */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-blue-700 rounded-full transition-colors"
            >
              <BsArrowLeft className="text-xl text-white" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <BsBook className="text-xl text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">BudgetBookz</h1>
                <p className="text-xs text-blue-100">Learn More, Spend Less</p>
              </div>
            </div>
          )}
          {showBack && <h1 className="text-xl font-bold text-white">{title}</h1>}
        </div>

        {/* Right: Profile */}
        {showProfile && currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-2 hover:bg-blue-700 rounded-full transition-colors"
            >
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {(userData?.name || currentUser.displayName || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>

            {/* Professional Dropdown Menu */}
            {showProfileMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                ></div>

                <div className="absolute right-0 top-14 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                    <div className="flex items-center gap-3">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow">
                          <span className="text-white font-bold text-lg">
                            {(userData?.name || currentUser.displayName || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {userData?.name || currentUser.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/dashboard');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <BsGrid className="text-lg text-gray-500" />
                      <span className="font-medium">Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/my-listings');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <BsBox className="text-lg text-gray-500" />
                      <span className="font-medium">My Listings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/favorites');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <BsHeart className="text-lg text-gray-500" />
                      <span className="font-medium">My Favorites</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/chats');
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <BsChatDots className="text-lg text-gray-500" />
                      <span className="font-medium">Messages</span>
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
                    >
                      <BsBoxArrowRight className="text-lg" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
