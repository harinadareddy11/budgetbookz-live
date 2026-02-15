import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsSearch, BsFunnel, BsX } from 'react-icons/bs';
import { getBooks } from '../services/bookService';
import { Book } from '../types';

export default function BookList() {
  const { category, syllabus } = useParams<{ category: string; syllabus: string }>();
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    condition: '',
    class: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // NEW: user location for distance
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchBooks();
  }, [category, syllabus]);

  useEffect(() => {
    // get current user location (for distance)
    if (navigator.geolocation) {
      // Try with lower accuracy first (faster)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(location);
        },
        (err) => {
          // Retry with high accuracy but longer timeout
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const location = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              };
              setUserLocation(location);
            },
            (err2) => {
              console.error('❌ Geolocation failed:', err2.message);
              // Use a default location (Hyderabad center) as fallback
              setUserLocation({ lat: 17.385044, lng: 78.486671 });
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
          );
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const fetchedBooks = await getBooks({
        category: category,
        syllabus: syllabus,
      });
      setBooks(fetchedBooks);
      setFilteredBooks(fetchedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  // Temporary debug - remove after fixing
  useEffect(() => {
    if (books.length > 0) {
      console.log('📚 First book data:', books[0]);
      console.log('📍 First book location:', (books[0] as any).location);
    }
  }, [books]);

  useEffect(() => {
    let result = books;

    if (searchQuery) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.condition) {
      result = result.filter((book) => book.condition === filters.condition);
    }

    if (filters.class) {
      result = result.filter((book) => book.class === filters.class);
    }

    if (filters.minPrice) {
      result = result.filter((book) => book.sellingPrice >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      result = result.filter((book) => book.sellingPrice <= parseFloat(filters.maxPrice));
    }

    setFilteredBooks(result);
  }, [searchQuery, filters, books]);

  const clearFilters = () => {
    setFilters({
      condition: '',
      class: '',
      minPrice: '',
      maxPrice: ''
    });
    setSearchQuery('');
  };

  // NEW: distance helper (same logic as in BookAssistant)
  const getDistanceKm = (
    userLoc: { lat: number; lng: number } | null,
    book: Book
  ): string | null => {
    // Try multiple ways to access location data from Firebase
    const bookData = book as any;
    const lat = bookData.location?.lat ?? bookData.lat;
    const lng = bookData.location?.lng ?? bookData.lng;

    if (!userLoc || typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }

    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat - userLoc.lat);
    const dLon = toRad(lng - userLoc.lng);
    const lat1 = toRad(userLoc.lat);
    const lat2 = toRad(lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 0.1) return '<100 m away';
    return `${d.toFixed(1)} km away`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading books...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {category ? category : 'All'} Books
            {syllabus && <span className="text-orange-500"> - {syllabus.toUpperCase()}</span>}
          </h1>
          <p className="text-gray-600">{filteredBooks.length} books available</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, or subject..."
            className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        {/* Filter Controls */}
        <div className="mb-6 flex gap-3 items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm font-medium"
          >
            <BsFunnel />
            Filters
          </button>

          {(filters.condition || filters.class || filters.minPrice || filters.maxPrice || searchQuery) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium"
            >
              <BsX className="text-xl" />
              Clear all
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, condition: e.target.value }))
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="">All</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Acceptable">Acceptable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <input
                  type="text"
                  value={filters.class}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, class: e.target.value }))
                  }
                  placeholder="e.g., 12"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                  }
                  placeholder="0"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                  }
                  placeholder="1000"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No books found
            </h3>
            <p className="text-gray-600 mb-6">
              {books.length === 0
                ? 'Be the first to list a book in this category!'
                : 'Try adjusting your filters or search'}
            </p>
            <button
              onClick={() => navigate('/sell')}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Sell Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
              >
                {/* Book Image */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  {book.images && book.images.length > 0 ? (
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      📖
                    </div>
                  )}

                  {/* Condition Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                    {book.condition}
                  </div>

                  {/* Discount Badge */}
                  {book.originalPrice > book.sellingPrice && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                      {Math.round((1 - book.sellingPrice / book.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="p-4 space-y-2">
                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {book.title}
                  </h3>

                  {/* Author */}
                  <p className="text-sm text-gray-600 line-clamp-1">
                    by {book.author}
                  </p>

                  {/* Distance (NEW) */}
                  {(() => {
                    const distance = userLocation ? getDistanceKm(userLocation, book) : null;
                    
                    return distance ? (
                      <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                        📍 {distance}
                      </div>
                    ) : null;
                  })()}

                  {/* Class & Subject */}
                  {book.class && book.subject && (
                    <div className="text-xs text-gray-500">
                      Class {book.class} • {book.subject}
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{book.sellingPrice}
                    </span>
                    {book.originalPrice > book.sellingPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{book.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="text-xs text-gray-500 pt-1">
                    📍 {book.location?.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}