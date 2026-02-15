import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import ExchangeProposalModal from './ExchangeProposalModal';
import { BsPhone, BsChatDots, BsGeoAlt, BsPerson, BsArrowRepeat } from 'react-icons/bs';


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
  status: string;
  views: number;
  createdAt: any;
}


export default function ExchangeBookDetails() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [book, setBook] = useState<ExchangeBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);


  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchBookDetails();
  }, [bookId, currentUser]);


  const formatLocation = (location: string | { city: string; state: string; lng: number; lat: number } | undefined): string => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    return `${location.city || ''}, ${location.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Not specified';
  };


  const fetchBookDetails = async () => {
    if (!bookId) return;


    try {
      const bookDoc = await getDoc(doc(db, 'exchangeBooks', bookId));


      if (bookDoc.exists()) {
        const bookData = { id: bookDoc.id, ...bookDoc.data() } as ExchangeBook;
        setBook(bookData);


        // Increment views (only if not the owner)
        if (currentUser?.uid !== bookData.ownerId) {
          await updateDoc(doc(db, 'exchangeBooks', bookId), {
            views: increment(1)
          });
        }
      } else {
        alert('Exchange book not found');
        navigate('/exchange');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      alert('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };


  const handleChatWithOwner = async () => {
    if (!book || !currentUser) return;


    try {
      // Check if chat room already exists
      const chatsRef = collection(db, 'chatRooms');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      
      let existingChatRoom = null;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.participants.includes(book.ownerId)) {
          existingChatRoom = docSnap.id;
        }
      });


      if (existingChatRoom) {
        // Navigate to existing chat
        navigate(`/chat/${existingChatRoom}`);
      } else {
        // Create new chat room
        const chatRoomData = {
          participants: [currentUser.uid, book.ownerId],
          participantNames: {
            [currentUser.uid]: userData?.name || currentUser.displayName || 'User',
            [book.ownerId]: book.ownerName
          },
          bookId: book.id,
          bookTitle: book.title,
          bookImage: book.images[0],
          lastMessage: '',
          lastMessageTime: new Date(),
          createdAt: new Date(),
          type: 'exchange' // Mark as exchange chat
        };


        const chatRoomRef = await addDoc(collection(db, 'chatRooms'), chatRoomData);
        navigate(`/chat/${chatRoomRef.id}`);
      }
    } catch (error) {
      console.error('Error creating/opening chat:', error);
      alert('Failed to open chat. Please try again.');
    }
  };


  const handleProposeExchange = () => {
    if (!book || !currentUser) return;
    setShowProposalModal(true);
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Exchange Details" showBack={true} showProfile={true} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading book details...</p>
          </div>
        </div>
      </div>
    );
  }


  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Exchange Details" showBack={true} showProfile={true} />
        <div className="text-center py-20">
          <p className="text-gray-600">Book not found</p>
        </div>
      </div>
    );
  }


  const isOwner = currentUser?.uid === book.ownerId;


  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Exchange Details" showBack={true} showProfile={true} />


      <div className="max-w-4xl mx-auto px-4 py-6 pb-40">
        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          {/* Main Image */}
          <div className="relative mb-4">
            <img
              src={book.images[selectedImage]}
              alt={book.title}
              className="w-full h-80 object-contain rounded-lg bg-gray-50"
            />
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <BsArrowRepeat />
              Exchange
            </div>
          </div>


          {/* Thumbnail Images */}
          {book.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {book.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${book.title} ${index + 1}`}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 flex-shrink-0 ${
                    selectedImage === index ? 'border-orange-500' : 'border-gray-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>


        {/* Book Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-4">by {book.author}</p>


          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {book.condition}
            </span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {book.category}
            </span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              {book.views || 0} views
            </span>
          </div>


          {book.description && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{book.description}</p>
            </div>
          )}


          {/* Looking For */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-orange-900 mb-2">
              Owner is looking for:
            </h3>
            <p className="text-orange-700">{book.lookingFor}</p>
          </div>
        </div>


        {/* Owner Information */}
        {!isOwner && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Owner Information</h3>


            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BsPerson className="text-gray-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-semibold text-gray-900">{book.ownerName}</p>
                </div>
              </div>


              <div className="flex items-center gap-3">
                <BsGeoAlt className="text-gray-500 text-xl" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{formatLocation(book.ownerLocation)}</p>
                </div>
              </div>


              {/* Phone Number */}
              {book.showPhone && book.phoneNumber && (
                <div className="flex items-center gap-3">
                  <BsPhone className="text-gray-500 text-xl" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Phone</p>
                    {showPhone ? (
                      <a
                        href={`tel:${book.phoneNumber}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {book.phoneNumber}
                      </a>
                    ) : (
                      <button
                        onClick={() => setShowPhone(true)}
                        className="text-orange-500 font-semibold hover:underline"
                      >
                        Click to reveal phone number
                      </button>
                    )}
                  </div>
                </div>
              )}


              {!book.showPhone && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    Owner has chosen not to display phone number. Use the chat feature to contact them.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Owner View */}
        {isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mb-4">
            <p className="text-blue-900 font-semibold">
              This is your exchange listing
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Others can see this book and contact you for exchange
            </p>
            <div className="mt-3">
              <button
                onClick={() => navigate('/exchange')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Back to Exchanges
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Action Buttons - HIGH Z-INDEX TO SHOW ABOVE BOTTOM NAV */}
      {!isOwner && (
        <div 
          className="fixed left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
          style={{ 
            bottom: '80px', // Position ABOVE the bottom navigation bar
            zIndex: 9999 
          }}
        >
          <div className="max-w-4xl mx-auto flex gap-3">
            <button
              onClick={handleChatWithOwner}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center gap-2"
            >
              <BsChatDots />
              Chat with Owner
            </button>
            <button
              onClick={handleProposeExchange}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold flex items-center justify-center gap-2"
            >
              <BsArrowRepeat />
              Propose Exchange
            </button>
          </div>
        </div>
      )}

      {/* Exchange Proposal Modal */}
      {book && (
        <ExchangeProposalModal
          isOpen={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          targetBook={{
            id: book.id,
            title: book.title,
            author: book.author,
            images: book.images,
            ownerId: book.ownerId,
            ownerName: book.ownerName
          }}
        />
      )}
    </div>
  );
}
