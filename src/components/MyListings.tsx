import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBooks, deleteBook, updateBook } from '../services/bookService';
import { Book } from '../types';
import { BsTrash, BsPencil, BsEye, BsCheckCircle, BsX } from 'react-icons/bs';

// Custom Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type: 'confirm' | 'success' | 'error';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <BsX className="text-2xl" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          {type === 'confirm' ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition-colors"
              >
                Confirm
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition-colors"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MyListings() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'success' | 'error';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchMyBooks();
  }, [currentUser, navigate]);

  const fetchMyBooks = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const userBooks = await getUserBooks(currentUser.uid);
      // Sort: Available books first, then sold books
      const sortedBooks = userBooks.sort((a, b) => {
        if (a.status === 'available' && b.status === 'sold') return -1;
        if (a.status === 'sold' && b.status === 'available') return 1;
        return 0;
      });
      setBooks(sortedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (type: 'confirm' | 'success' | 'error', title: string, message: string, onConfirm: () => void = () => {}) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleMarkAsSold = async (book: Book) => {
    showModal(
      'confirm',
      'Mark as Sold',
      `Are you sure you want to mark "${book.title}" as sold?`,
      async () => {
        try {
          await updateBook(book.id, { status: 'sold' });
          
          setBooks(prevBooks => {
            const updatedBooks = prevBooks.map(b => 
              b.id === book.id ? { ...b, status: 'sold' as const } : b
            );
            return updatedBooks.sort((a, b) => {
              if (a.status === 'available' && b.status === 'sold') return -1;
              if (a.status === 'sold' && b.status === 'available') return 1;
              return 0;
            });
          });
          
          showModal('success', 'Success!', 'Book marked as sold successfully!');
        } catch (error) {
          console.error('Error updating book:', error);
          showModal('error', 'Error', 'Failed to update book. Please try again.');
        }
      }
    );
  };

  const handleMarkAsAvailable = async (book: Book) => {
    showModal(
      'confirm',
      'Mark as Available',
      `Are you sure you want to mark "${book.title}" as available again?`,
      async () => {
        try {
          await updateBook(book.id, { status: 'available' });
          
          setBooks(prevBooks => {
            const updatedBooks = prevBooks.map(b => 
              b.id === book.id ? { ...b, status: 'available' as const } : b
            );
            return updatedBooks.sort((a, b) => {
              if (a.status === 'available' && b.status === 'sold') return -1;
              if (a.status === 'sold' && b.status === 'available') return 1;
              return 0;
            });
          });
          
          showModal('success', 'Success!', 'Book marked as available successfully!');
        } catch (error) {
          console.error('Error updating book:', error);
          showModal('error', 'Error', 'Failed to update book. Please try again.');
        }
      }
    );
  };

  const handleDelete = async (book: Book) => {
    showModal(
      'confirm',
      'Delete Book',
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteBook(book.id);
          setBooks(books.filter(b => b.id !== book.id));
          showModal('success', 'Deleted!', 'Book deleted successfully!');
        } catch (error) {
          console.error('Error deleting book:', error);
          showModal('error', 'Error', 'Failed to delete book. Please try again.');
        }
      }
    );
  };

  // Calculate stats
  const listedBooks = books.filter(book => book.status === 'available').length;
  const soldBooks = books.filter(book => book.status === 'sold').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />

      <div className="max-w-7xl mx-auto p-4 pb-24">
        {/* Header with Stats */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Listings</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <p className="text-3xl font-bold text-gray-900 mb-1">{books.length}</p>
              <p className="text-sm text-gray-600">Total Books</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
              <p className="text-3xl font-bold text-green-600 mb-1">{listedBooks}</p>
              <p className="text-sm text-gray-600">Available</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
              <p className="text-3xl font-bold text-blue-600 mb-1">{soldBooks}</p>
              <p className="text-sm text-gray-600">Sold</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
              <p className="text-3xl font-bold text-purple-600 mb-1">
                {books.reduce((sum, book) => sum + (book.views || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
          </div>
        </div>

        {/* Books List */}
        {books.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No books listed yet</h3>
            <p className="text-gray-600 mb-6">Start selling your books today</p>
            <button
              onClick={() => navigate('/sell')}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition-colors"
            >
              List Your First Book
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.id}
                className={`bg-white rounded-xl border transition-all ${
                  book.status === 'sold' 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Book Image */}
                  <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {book.images && book.images[0] ? (
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                        📖
                      </div>
                    )}
                    {book.status === 'sold' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SOLD</span>
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 text-lg">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{book.author}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.class && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                          Class {book.class}
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                        {book.condition}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                        book.status === 'available' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {book.status === 'available' ? '✓ Available' : '✓ Sold'}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                        <BsEye className="text-xs" />
                        {book.views || 0} views
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl font-bold text-blue-600">
                        ₹{book.sellingPrice}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{book.originalPrice}
                      </span>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                        {Math.round((1 - book.sellingPrice / book.originalPrice) * 100)}% OFF
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/book/${book.id}`)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-semibold transition-colors border border-blue-200"
                      >
                        View
                      </button>
                      
                      {book.status === 'available' && (
                        <>
                          <button
                            onClick={() => navigate(`/edit-book/${book.id}`)}
                            className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 text-sm font-semibold transition-colors border border-orange-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleMarkAsSold(book)}
                            className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-semibold transition-colors border border-green-200 flex items-center gap-1.5"
                          >
                            <BsCheckCircle />
                            Mark as Sold
                          </button>
                        </>
                      )}
                      
                      {book.status === 'sold' && (
                        <button
                          onClick={() => handleMarkAsAvailable(book)}
                          className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-semibold transition-colors border border-green-200"
                        >
                          Mark as Available
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(book)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-semibold transition-colors border border-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
