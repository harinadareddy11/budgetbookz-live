import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import { BsInboxes, BsPencil, BsTrash } from 'react-icons/bs';
import EditExchangeModal from './EditExchangeModal';

interface ExchangeBook {
  id: string;
  title: string;
  author: string;
  description: string;
  condition: string;
  category: string;
  images: string[];
  ownerId: string;
  ownerName: string;
  ownerLocation: string | { city: string; state: string; lng: number; lat: number };
  lookingFor: string;
  phoneNumber: string;
  showPhone: boolean;
  status: 'available' | 'exchanged' | 'pending';
  createdAt: any;
}

export default function ExchangeBooks() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'browse' | 'myExchanges' | 'add'>('browse');
  const [exchangeBooks, setExchangeBooks] = useState<ExchangeBook[]>([]);
  const [myExchangeBooks, setMyExchangeBooks] = useState<ExchangeBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editingBook, setEditingBook] = useState<ExchangeBook | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form state for adding exchange book
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    condition: 'good',
    category: '',
    lookingFor: '',
    phoneNumber: '',
    showPhone: true
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchExchangeBooks();
  }, [currentUser]);

  const fetchExchangeBooks = async () => {
    setLoading(true);
    try {
      // Fetch all available exchange books
      const q = query(
        collection(db, 'exchangeBooks'),
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const books = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExchangeBook[];
      
      setExchangeBooks(books.filter(book => book.ownerId !== currentUser?.uid));

      // Fetch user's exchange books
      if (currentUser) {
        const myQ = query(
          collection(db, 'exchangeBooks'),
          where('ownerId', '==', currentUser.uid)
        );
        const mySnapshot = await getDocs(myQ);
        const myBooks = mySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ExchangeBook[];
        setMyExchangeBooks(myBooks);
      }
    } catch (error) {
      console.error('Error fetching exchange books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 3) {
      alert('Maximum 3 images allowed for exchange books');
      return;
    }

    setImageFiles([...imageFiles, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatLocation = (location: string | { city: string; state: string; lng: number; lat: number } | undefined): string => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    return `${location.city || ''}, ${location.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Not specified';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    if (imageFiles.length === 0) {
      alert('Please add at least one image');
      return;
    }

    setSubmitting(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const imageRef = ref(storage, `exchangeBooks/${currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      // Add exchange book to Firestore
      await addDoc(collection(db, 'exchangeBooks'), {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        condition: formData.condition,
        category: formData.category,
        lookingFor: formData.lookingFor,
        phoneNumber: formData.phoneNumber,
        showPhone: formData.showPhone,
        images: imageUrls,
        ownerId: currentUser.uid,
        ownerName: userData?.name || currentUser.displayName || 'User',
        ownerLocation: userData?.location || 'Not specified',
        status: 'available',
        createdAt: new Date(),
        views: 0
      });

      alert('Book listed for exchange successfully!');
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        condition: 'good',
        category: '',
        lookingFor: '',
        phoneNumber: '',
        showPhone: true
      });
      setImageFiles([]);
      setImagePreviews([]);
      
      // Refresh list and switch to My Exchanges tab
      fetchExchangeBooks();
      setActiveTab('myExchanges');
    } catch (error) {
      console.error('Error adding exchange book:', error);
      alert('Failed to list book for exchange. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string, images: string[]) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${bookTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'exchangeBooks', bookId));

      // Delete images from Storage
      for (const imageUrl of images) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (imgError) {
          console.warn('Error deleting image:', imgError);
          // Continue even if image deletion fails
        }
      }

      alert('Book deleted successfully! ✅');
      fetchExchangeBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Exchange Books" showBack={true} showProfile={true} />

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-2 font-semibold transition border-b-2 ${
                activeTab === 'browse'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Browse Books
            </button>
            <button
              onClick={() => setActiveTab('myExchanges')}
              className={`py-4 px-2 font-semibold transition border-b-2 ${
                activeTab === 'myExchanges'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600'
              }`}
            >
              My Exchanges ({myExchangeBooks.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-4 px-2 font-semibold transition border-b-2 ${
                activeTab === 'add'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-600'
              }`}
            >
              + List Book
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Exchange Requests Card */}
        <div 
          onClick={() => navigate('/exchange-requests')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 mb-6 cursor-pointer hover:shadow-xl transition transform hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <BsInboxes className="text-3xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Exchange Requests</h3>
                <p className="text-blue-100 text-sm">View and manage your proposals</p>
              </div>
            </div>
            <div className="text-3xl">→</div>
          </div>
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Available for Exchange</h2>
              <p className="text-sm text-gray-600">Find books to swap with others</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading exchange books...</p>
              </div>
            ) : exchangeBooks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500 text-lg mb-4">No books available for exchange yet</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  List Your First Book
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exchangeBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/exchange-book/${book.id}`)}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 cursor-pointer"
                  >
                    <div className="relative mb-3">
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Exchange
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{book.author}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {book.condition}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {book.category}
                      </span>
                    </div>

                    <div className="mb-3 p-2 bg-orange-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Looking for:</p>
                      <p className="text-sm font-semibold text-orange-600 line-clamp-2">{book.lookingFor}</p>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-500">
                        <p>Owner: {book.ownerName}</p>
                        <p>Location: {formatLocation(book.ownerLocation)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/exchange-book/${book.id}`);
                        }}
                        className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-semibold text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/exchange-book/${book.id}`);
                        }}
                        className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-sm"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Exchanges Tab - WITH EDIT & DELETE */}
        {activeTab === 'myExchanges' && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Exchange Listings</h2>
              <p className="text-sm text-gray-600">Manage your books listed for exchange</p>
            </div>

            {myExchangeBooks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500 text-lg mb-4">You haven't listed any books for exchange</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  List a Book
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myExchangeBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md p-4 transition"
                  >
                    <div className="flex gap-4">
                      <img
                        src={book.images[0]}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => navigate(`/exchange-book/${book.id}`)}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                        <div className="flex gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            book.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {book.status}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {book.condition}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Looking for:</p>
                        <p className="text-sm font-semibold text-orange-600 line-clamp-2 mb-3">{book.lookingFor}</p>
                        
                        {/* Action Buttons - Edit, View, Delete */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBook(book);
                              setShowEditModal(true);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm"
                          >
                            <BsPencil />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/exchange-book/${book.id}`);
                            }}
                            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id, book.title, book.images);
                            }}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm"
                          >
                            <BsTrash />
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
        )}

        {/* Add Exchange Book Tab */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">List Book for Exchange</h2>
              <p className="text-sm text-gray-600">Swap your book with others - no money involved!</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              {/* Images */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Book Images * (Max 3)
                </label>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {imagePreviews.length < 3 && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter book title"
                />
              </div>

              {/* Author */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter author name"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Describe the book"
                />
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="new">Like New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select category</option>
                  <option value="school">School</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="graduate">Graduate</option>
                  <option value="competitive">Competitive</option>
                  <option value="novel">Novel</option>
                  <option value="comics">Comics</option>
                  <option value="fiction">Fiction</option>
                </select>
              </div>

              {/* Looking For */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What are you looking for in exchange? *
                </label>
                <textarea
                  required
                  value={formData.lookingFor}
                  onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., JEE preparation books, Class 11 Physics, Fiction novels"
                />
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Show Phone Checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.showPhone}
                    onChange={(e) => setFormData({ ...formData, showPhone: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">
                    Allow others to see my phone number
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  If unchecked, users can only contact you through chat
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:bg-gray-400"
              >
                {submitting ? 'Listing...' : 'List for Exchange'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Edit Exchange Modal */}
      {editingBook && (
        <EditExchangeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingBook(null);
          }}
          book={editingBook}
          onSuccess={() => {
            fetchExchangeBooks();
          }}
        />
      )}
    </div>
  );
}
