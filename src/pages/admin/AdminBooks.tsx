import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BsArrowLeft, BsTrash, BsEye, BsBook, BsX } from 'react-icons/bs';
import { LoadingSpinner, ConfirmModal } from '../../components';

const ADMIN_EMAILS = ['admin@budgetbookz.com', 'harinadareddy11.1@gmail.com'];

interface Book {
  id: string;
  title: string;
  author: string;
  sellingPrice: number;
  suggestedPrice?: number;
  category: string;
  condition: string;
  description: string;
  images: string[];
  sellerName: string;
  sellerId: string;
  syllabus?: string;
  class?: string;
  subject?: string;
  genre?: string;
  createdAt: any;
}

// Book Detail Modal
interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

const BookDetailModal: React.FC<BookModalProps> = ({ isOpen, onClose, book }) => {
  if (!isOpen || !book) return null;

  // Display selling price as primary, show suggested if different
  const sellingPrice = book.sellingPrice || 0;
  const suggestedPrice = book.suggestedPrice || 0;
  const hasSuggestion = suggestedPrice > 0 && suggestedPrice < sellingPrice;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Book Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <BsX className="text-3xl" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Images */}
          {book.images && book.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {book.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${book.title} ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              ))}
            </div>
          )}

          {/* Book Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{book.title || 'No Title'}</h3>
              <p className="text-gray-600">by {book.author || 'Unknown Author'}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                <p className="text-2xl font-bold text-blue-600">₹{sellingPrice}</p>
              </div>

              {hasSuggestion && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Suggested Price</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-600">₹{suggestedPrice}</p>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">
                      LOWER
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Condition</p>
                <p className="font-bold text-purple-700">{book.condition || 'Not Specified'}</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="font-bold text-orange-700 capitalize">{book.category || 'General'}</p>
              </div>

              {book.syllabus && (
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Syllabus</p>
                  <p className="font-bold text-pink-700">{book.syllabus}</p>
                </div>
              )}
              
              {book.class && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Class</p>
                  <p className="font-bold text-indigo-700">{book.class}</p>
                </div>
              )}
              
              {book.subject && (
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Subject</p>
                  <p className="font-bold text-teal-700">{book.subject}</p>
                </div>
              )}

              {book.genre && (
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Genre</p>
                  <p className="font-bold text-cyan-700">{book.genre}</p>
                </div>
              )}
            </div>

            {book.description && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            )}

            <div className="pt-4 border-t-2 border-gray-200 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Seller Information</p>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{book.sellerName || 'Unknown Seller'}</p>
                <p className="text-xs text-gray-500">Seller ID: {book.sellerId || 'N/A'}</p>
                {book.createdAt && book.createdAt.seconds && (
                  <p className="text-xs text-gray-500">
                    Listed: {new Date(book.createdAt.seconds * 1000).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminBooks() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email || '')) {
      navigate('/admin/login');
      return;
    }
    fetchBooks();
  }, [currentUser, navigate]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'books'));
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(booksData);
      console.log('Fetched books:', booksData); // Debug
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      await deleteDoc(doc(db, 'books', selectedBook.id));
      setBooks(books.filter(b => b.id !== selectedBook.id));
      setShowDeleteModal(false);
      alert('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    }
  };

  const filteredBooks = books.filter(book => {
    if (filter === 'all') return true;
    return book.category === filter;
  });

  if (loading) {
    return <LoadingSpinner message="Loading books..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Book"
        message={`Are you sure you want to delete "${selectedBook?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        book={selectedBook}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <BsArrowLeft />
            <span className="font-semibold">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">All Books</h1>
          <p className="text-gray-600 mt-1">Manage all listed books</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
          <p className="text-3xl font-bold text-gray-900 mb-1">{books.length}</p>
          <p className="text-sm text-gray-600">Total Books Listed</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Categories ({books.length})</option>
            <option value="school">School ({books.filter(b => b.category === 'school').length})</option>
            <option value="intermediate">Intermediate ({books.filter(b => b.category === 'intermediate').length})</option>
            <option value="graduate">Graduate ({books.filter(b => b.category === 'graduate').length})</option>
            <option value="competitive">Competitive ({books.filter(b => b.category === 'competitive').length})</option>
            <option value="novel">Novel ({books.filter(b => b.category === 'novel').length})</option>
            <option value="comics">Comics ({books.filter(b => b.category === 'comics').length})</option>
            <option value="fiction">Fiction ({books.filter(b => b.category === 'fiction').length})</option>
          </select>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <BsBook className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No books have been listed yet.' 
                : `No books found in ${filter} category.`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => {
              const sellingPrice = book.sellingPrice || 0;
              const suggestedPrice = book.suggestedPrice || 0;
              const hasSuggestion = suggestedPrice > 0 && suggestedPrice < sellingPrice;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <img
                    src={book.images && book.images[0] ? book.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{book.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author || 'Unknown'}</p>
                    
                    {/* Price Display */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-blue-600">₹{sellingPrice}</span>
                      {hasSuggestion && (
                        <>
                          <span className="text-xs text-gray-500">(Suggested: ₹{suggestedPrice})</span>
                        </>
                      )}
                      <span className="ml-auto text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {book.condition || 'N/A'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-1">
                      Category: <span className="font-medium capitalize">{book.category || 'General'}</span>
                    </p>
                    <p className="text-xs text-gray-500 mb-3">Seller: {book.sellerName || 'Unknown'}</p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBook(book);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <BsEye />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBook(book);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <BsTrash />
                        Delete
                      </button>
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
