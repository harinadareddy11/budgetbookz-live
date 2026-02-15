import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsHeart } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { getUserFavorites } from '../services/favoriteService';
import { getBookById } from '../services/bookService';
import { Book } from '../types';

export default function Favorites() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, [currentUser, navigate]);

  const fetchFavorites = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const favoriteIds = await getUserFavorites(currentUser.uid);
      console.log('📚 Favorite IDs:', favoriteIds);

      // Fetch book details for each favorite
      const bookPromises = favoriteIds.map(id => getBookById(id));
      const books = await Promise.all(bookPromises);
      
      // Filter out null values
      const validBooks = books.filter(book => book !== null) as Book[];
      
      console.log('✅ Favorite books:', validBooks);
      setFavoriteBooks(validBooks);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 text-sm">{favoriteBooks.length} saved books</p>
        </div>
      </div>

      {favoriteBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <BsHeart className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No favorites yet</p>
          <p className="text-gray-400 text-sm mb-6">Start saving books you like!</p>
          <button
            onClick={() => navigate('/all-books')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/book/${book.id}`)}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Book Image */}
              <div className="aspect-[3/4] bg-gray-100 relative">
                {book.images && book.images[0] ? (
                  <img
                    src={book.images[0]}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow">
                  <BsHeart className="text-red-500 fill-red-500" />
                </div>
              </div>

              {/* Book Info */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                  {book.author}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-orange-500">
                    ₹{book.sellingPrice}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {book.condition}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
