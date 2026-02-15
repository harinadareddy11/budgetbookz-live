import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsHouse, BsSearch, BsPlus, BsPerson, BsChatDots } from 'react-icons/bs';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine page title based on route
const getPageTitle = () => {
  const path = location.pathname;
  if (path === '/dashboard') return 'Dashboard';
  if (path === '/sell') return 'Sell Books';
  if (path === '/my-listings') return 'My Listings';
  if (path === '/favorites') return 'My Favorites';  // ADD THIS
  if (path === '/chats') return 'Messages';
  if (path.includes('/categories')) return 'Categories';
  if (path.includes('/books')) return 'Book Details';
  if (path.includes('/chat/')) return 'Chat';
  return 'BudgetBookz';
};


  // Check if we should show back button
  const shouldShowBack = location.pathname !== '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with user profile */}
      <Header 
        title={getPageTitle()} 
        showBack={shouldShowBack}
        showProfile={true}
      />

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname === '/dashboard' 
                ? 'text-orange-500' 
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <BsHouse className="text-2xl" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => navigate('/all-books')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname === '/all-books' 
                ? 'text-orange-500' 
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <BsSearch className="text-2xl" />
            <span className="text-xs font-medium">Browse</span>
          </button>

          <button
            onClick={() => navigate('/sell')}
            className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 hover:text-orange-500"
          >
            <div className="w-14 h-14 -mt-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors">
              <BsPlus className="text-4xl text-white" />
            </div>
            <span className="text-xs font-medium mt-1">Sell</span>
          </button>

          <button
            onClick={() => navigate('/chats')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname.includes('/chat') 
                ? 'text-orange-500' 
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <BsChatDots className="text-2xl" />
            <span className="text-xs font-medium">Chats</span>
          </button>

          <button
            onClick={() => navigate('/my-listings')}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              location.pathname === '/my-listings' 
                ? 'text-orange-500' 
                : 'text-gray-600 hover:text-orange-500'
            }`}
          >
            <BsPerson className="text-2xl" />
            <span className="text-xs font-medium">My Books</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
