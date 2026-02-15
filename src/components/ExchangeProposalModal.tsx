import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { BsX, BsBook, BsArrowRepeat } from 'react-icons/bs';

interface ExchangeProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBook: {
    id: string;
    title: string;
    author: string;
    images: string[];
    ownerId: string;
    ownerName: string;
  };
}

interface MyBook {
  id: string;
  title: string;
  author: string;
  images: string[];
  condition: string;
  category: string;
}

export default function ExchangeProposalModal({ isOpen, onClose, targetBook }: ExchangeProposalModalProps) {
  const { currentUser, userData } = useAuth();
  const [myBooks, setMyBooks] = useState<MyBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingBooks, setFetchingBooks] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchMyBooks();
      // Pre-fill message
      setMessage(`Hi! I'm interested in exchanging my book for "${targetBook.title}". Let me know if you're interested!`);
    }
  }, [isOpen, currentUser]);

  const fetchMyBooks = async () => {
    if (!currentUser) return;

    try {
      setFetchingBooks(true);
      
      // Fetch from both 'books' and 'exchangeBooks' collections
      const booksQuery = query(
        collection(db, 'books'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'available')
      );
      
      const exchangeBooksQuery = query(
        collection(db, 'exchangeBooks'),
        where('ownerId', '==', currentUser.uid),
        where('status', '==', 'available')
      );

      const [booksSnapshot, exchangeBooksSnapshot] = await Promise.all([
        getDocs(booksQuery),
        getDocs(exchangeBooksQuery)
      ]);

      const books: MyBook[] = [];
      
      booksSnapshot.forEach((doc) => {
        books.push({ id: doc.id, ...doc.data() } as MyBook);
      });
      
      exchangeBooksSnapshot.forEach((doc) => {
        books.push({ id: doc.id, ...doc.data() } as MyBook);
      });

      setMyBooks(books);
    } catch (error) {
      console.error('Error fetching my books:', error);
      alert('Failed to load your books');
    } finally {
      setFetchingBooks(false);
    }
  };

  const handleSubmitProposal = async () => {
    if (!selectedBookId) {
      alert('Please select a book to offer for exchange');
      return;
    }

    if (!message.trim()) {
      alert('Please add a message');
      return;
    }

    setLoading(true);

    try {
      // Get selected book details
      const selectedBook = myBooks.find(book => book.id === selectedBookId);
      if (!selectedBook) return;

      // Create exchange request
      const exchangeRequest = {
        requesterId: currentUser?.uid,
        requesterName: userData?.name || currentUser?.displayName || 'User',
        requesterBookId: selectedBookId,
        requesterBookTitle: selectedBook.title,
        requesterBookAuthor: selectedBook.author,
        requesterBookImage: selectedBook.images[0],
        
        targetBookId: targetBook.id,
        targetBookTitle: targetBook.title,
        targetBookAuthor: targetBook.author,
        targetBookImage: targetBook.images[0],
        targetOwnerId: targetBook.ownerId,
        targetOwnerName: targetBook.ownerName,
        
        message: message.trim(),
        status: 'pending', // pending, accepted, rejected
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'exchangeRequests'), exchangeRequest);

      // Create notification for target book owner
      const notification = {
        userId: targetBook.ownerId,
        type: 'exchange_request',
        title: 'New Exchange Proposal',
        message: `${userData?.name || 'Someone'} wants to exchange "${selectedBook.title}" for your "${targetBook.title}"`,
        bookId: targetBook.id,
        requesterId: currentUser?.uid,
        read: false,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'notifications'), notification);

      alert('Exchange proposal sent successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Error submitting exchange proposal:', error);
      alert('Failed to send proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BsArrowRepeat className="text-orange-500" />
            Propose Exchange
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <BsX className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Target Book */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">You want:</h3>
            <div className="bg-gray-50 rounded-lg p-4 flex gap-4">
              <img
                src={targetBook.images[0]}
                alt={targetBook.title}
                className="w-20 h-28 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{targetBook.title}</h4>
                <p className="text-sm text-gray-600">{targetBook.author}</p>
                <p className="text-sm text-gray-500 mt-1">by {targetBook.ownerName}</p>
              </div>
            </div>
          </div>

          {/* Select Your Book */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">You offer:</h3>
            
            {fetchingBooks ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading your books...</p>
              </div>
            ) : myBooks.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <BsBook className="text-3xl text-yellow-600 mx-auto mb-2" />
                <p className="text-yellow-800 font-semibold">No books available</p>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to list some books before proposing an exchange
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {myBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`flex gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedBookId === book.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{book.title}</h4>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {book.condition}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {book.category}
                        </span>
                      </div>
                    </div>
                    {selectedBookId === book.id && (
                      <div className="text-orange-500 text-2xl">✓</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-900 mb-2">
              Message to owner
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the book owner..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitProposal}
              disabled={loading || !selectedBookId || myBooks.length === 0}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <BsArrowRepeat />
                  Send Proposal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
