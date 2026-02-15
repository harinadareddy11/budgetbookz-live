import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BsSearch, BsFunnel, BsX, BsGeoAlt } from 'react-icons/bs';
import { getBooks } from '../services/bookService';
import { Book } from '../types';

export default function AllBooks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const categoryFromUrl = searchParams.get('category');
  
  const [filters, setFilters] = useState({
    category: categoryFromUrl || '',
    syllabus: '',
    condition: '',
    class: '',
    minPrice: '',
    maxPrice: ''
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            () => {
              setUserLocation({ lat: 17.385044, lng: 78.486671 });
            },
            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
          );
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }));
    }
  }, [categoryFromUrl]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const allBooks = await getBooks();
      setBooks(allBooks);
      setFilteredBooks(allBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDistanceKm = (
    userLoc: { lat: number; lng: number } | null,
    book: Book
  ): string | null => {
    const bookData = book as any;
    const lat = bookData.location?.lat ?? bookData.lat;
    const lng = bookData.location?.lng ?? bookData.lng;

    if (!userLoc || typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }

    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat - userLoc.lat);
    const dLon = toRad(lng - userLoc.lng);
    const lat1 = toRad(userLoc.lat);
    const lat2 = toRad(lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    if (d < 0.1) return '<100m';
    if (d < 1) return `${Math.round(d * 1000)}m`;
    return `${d.toFixed(1)}km`;
  };

  // Apply filters
  useEffect(() => {
    let result = books;

    if (searchQuery) {
      result = result.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter(book => book.category === filters.category);
    }

    if (filters.syllabus) {
      result = result.filter(book => book.syllabus === filters.syllabus);
    }

    if (filters.condition) {
      result = result.filter(book => book.condition === filters.condition);
    }

    if (filters.class) {
      result = result.filter(book => book.class === filters.class);
    }

    if (filters.minPrice) {
      result = result.filter(book => book.sellingPrice >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(book => book.sellingPrice <= parseFloat(filters.maxPrice));
    }

    setFilteredBooks(result);
  }, [searchQuery, filters, books]);

  const clearFilters = () => {
    setFilters({
      category: '',
      syllabus: '',
      condition: '',
      class: '',
      minPrice: '',
      maxPrice: ''
    });
    setSearchQuery('');
    navigate('/all-books');
  };

  const hasActiveFilters = filters.category || filters.syllabus || filters.condition || 
    filters.class || filters.minPrice || filters.maxPrice || searchQuery;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {filters.category ? `${filters.category} Books` : 'All Books'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available
              </p>
            </div>
            <button
              onClick={() => navigate('/sell')}
              className="hidden md:block px-6 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Sell Books
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or subject..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Filter Controls */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showFilters
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <BsFunnel />
            <span>Filters</span>
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-lg font-medium hover:border-gray-300 transition-colors"
            >
              <BsX className="text-xl" />
              <span>Clear All</span>
            </button>
          )}

          <div className="ml-auto text-sm text-gray-600 font-medium">
            {filteredBooks.length} of {books.length} books
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 mb-6 border-2 border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  <optgroup label="Academic">
                    <option value="school">School</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="graduate">Graduate</option>
                    <option value="competitive">Competitive</option>
                  </optgroup>
                  <optgroup label="Story">
                    <option value="novel">Novels</option>
                    <option value="comics">Comics</option>
                    <option value="fiction">Fiction</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Conditions</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Acceptable">Acceptable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                <input
                  type="text"
                  value={filters.class}
                  onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
                  placeholder="e.g., 12"
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price (₹)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  placeholder="0"
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price (₹)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  placeholder="1000"
                  className="w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
            <div className="text-7xl mb-6">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-8">
              {books.length === 0 
                ? 'Be the first to list a book!' 
                : 'Try adjusting your filters or search'}
            </p>
            <button
              onClick={() => navigate('/sell')}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Sell Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBooks.map((book) => {
              const distance = userLocation ? getDistanceKm(userLocation, book) : null;
              const discount = Math.round((1 - book.sellingPrice / book.originalPrice) * 100);
              
              return (
                <div
                  key={book.id}
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Book Image */}
                  <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                    {book.images && book.images[0] ? (
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        📖
                      </div>
                    )}
                    
                    {/* Condition Badge */}
                    <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-md border border-gray-200">
                      {book.condition}
                    </div>

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{book.author}</p>
                    
                    {book.class && book.subject && (
                      <p className="text-xs text-gray-500 mb-3">
                        Class {book.class} • {book.subject}
                      </p>
                    )}

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-blue-600">₹{book.sellingPrice}</span>
                      <span className="text-sm text-gray-400 line-through">₹{book.originalPrice}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {distance ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <BsGeoAlt /> {distance}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <BsGeoAlt /> {book.location.city}
                        </span>
                      )}
                      <span>{book.views || 0} views</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
