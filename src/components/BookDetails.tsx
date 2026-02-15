import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsHeart, BsHeartFill, BsShareFill, BsTelephone, BsChatDots } from 'react-icons/bs';
import { getBookById, incrementBookViews } from '../services/bookService';
import { createChatRoom } from '../services/chatService';
import { addToFavorites, removeFromFavorites, isFavorited } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types';

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // NEW: user location for distance
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (id) {
      fetchBook(id);
    }
  }, [id]);

  // Get user location once
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
          console.error('Geolocation error in BookDetails:', err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Check if book is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (currentUser && book) {
        const favorited = await isFavorited(currentUser.uid, book.id);
        setIsFavorite(favorited);
      }
    };
    checkFavorite();
  }, [currentUser, book]);

  const fetchBook = async (bookId: string) => {
    setLoading(true);
    try {
      const fetchedBook = await getBookById(bookId);
      if (fetchedBook) {
        setBook(fetchedBook);
        // Increment view count
        await incrementBookViews(bookId);
      } else {
        alert('Book not found');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      alert('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && book) {
      navigator.share({
        title: book.title,
        text: `Check out this book: ${book.title} by ${book.author} for ₹${book.sellingPrice}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      alert('Please login to save favorites');
      navigate('/login');
      return;
    }

    if (!book) return;

    try {
      if (isFavorite) {
        await removeFromFavorites(currentUser.uid, book.id);
        setIsFavorite(false);
        alert('❌ Removed from favorites');
      } else {
        await addToFavorites(currentUser.uid, book.id);
        setIsFavorite(true);
        alert('❤️ Added to favorites!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    }
  };

  const handleContact = async () => {
    if (!currentUser) {
      alert('Please login to chat with seller');
      navigate('/login');
      return;
    }

    if (book?.sellerId === currentUser.uid) {
      alert('This is your own book!');
      return;
    }

    if (!book) return;

    try {
      const chatRoomId = await createChatRoom(
        book.id,
        book.title,
        book.images[0] || '',
        book.sellerId,
        book.sellerName,
        currentUser.uid,
        userData?.name || currentUser.displayName || 'User'
      );

      navigate(`/chat/${chatRoomId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to start chat');
    }
  };

  const handleCall = () => {
    if (book?.showPhoneNumber && book.sellerPhone) {
      window.location.href = `tel:${book.sellerPhone}`;
    }
  };

  // NEW: distance helper
  const getDistanceKm = (
    userLoc: { lat: number; lng: number } | null,
    book: Book | null
  ): string | null => {
    if (!userLoc || !book) return null;

    const lat = (book as any).lat ?? book.location?.lat;
    const lng = (book as any).lng ?? book.location?.lng;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
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

    if (d < 0.1) return '<100 m away';
    return `${d.toFixed(1)} km away`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Book not found</p>
          <button
            onClick={() => navigate('/categories')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Browse Books
          </button>
        </div>
      </div>
    );
  }

  const distanceText = getDistanceKm(userLocation, book);

  return (
    <div className="max-w-7xl mx-auto p-4 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4">
            {book.images && book.images.length > 0 ? (
              <img
                src={book.images[currentImageIndex]}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {book.images && book.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {book.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${book.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Book Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-600 mb-1">by {book.author}</p>
              {distanceText && (
                <p className="text-sm text-gray-500 mb-3">{distanceText}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFavoriteToggle}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isFavorite ? (
                  <BsHeartFill className="text-2xl text-red-500" />
                ) : (
                  <BsHeart className="text-2xl text-gray-600" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <BsShareFill className="text-2xl text-gray-600" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-3 mb-2">
              <p className="text-4xl font-bold text-orange-500">₹{book.sellingPrice}</p>
              <p className="text-xl text-gray-400 line-through">₹{book.originalPrice}</p>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {Math.round((1 - book.sellingPrice / book.originalPrice) * 100)}% OFF
              </span>
            </div>
            <p className="text-sm text-gray-600">Suggested Price: ₹{book.suggestedPrice}</p>
          </div>

          {/* Book Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Condition:</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {book.condition}
              </span>
            </div>

            {book.class && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium text-gray-900">{book.class}</span>
              </div>
            )}

            {book.subject && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium text-gray-900">{book.subject}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium text-gray-900 capitalize">{book.category}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600">Syllabus:</span>
              <span className="font-medium text-gray-900 uppercase">{book.syllabus}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-gray-900">
                📍 {book.location.city}, {book.location.state}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">{book.description}</p>
          </div>

          {/* Seller Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
            <p className="text-gray-700 font-medium">{book.sellerName}</p>
            {book.showPhoneNumber && (
              <p className="text-gray-600">📞 {book.sellerPhone}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Posted: {new Date(book.createdAt).toLocaleDateString('en-IN')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleContact}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
            >
              <BsChatDots className="text-xl" />
              Chat with Seller
            </button>

            {book.showPhoneNumber && (
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
              >
                <BsTelephone className="text-xl" />
                Call
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
