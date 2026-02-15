import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import { BsArrowRepeat, BsCheck, BsX, BsClock } from 'react-icons/bs';

interface ExchangeRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterBookId: string;
  requesterBookTitle: string;
  requesterBookAuthor: string;
  requesterBookImage: string;
  targetBookId: string;
  targetBookTitle: string;
  targetBookAuthor: string;
  targetBookImage: string;
  targetOwnerId: string;
  targetOwnerName: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt: any;
}

export default function ExchangeRequests() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth(); // UPDATED: Added userData
  const [receivedRequests, setReceivedRequests] = useState<ExchangeRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ExchangeRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchExchangeRequests();
  }, [currentUser]);

  const fetchExchangeRequests = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      const receivedQuery = query(
        collection(db, 'exchangeRequests'),
        where('targetOwnerId', '==', currentUser.uid)
      );

      const sentQuery = query(
        collection(db, 'exchangeRequests'),
        where('requesterId', '==', currentUser.uid)
      );

      const [receivedSnapshot, sentSnapshot] = await Promise.all([
        getDocs(receivedQuery),
        getDocs(sentQuery)
      ]);

      const received: ExchangeRequest[] = [];
      const sent: ExchangeRequest[] = [];

      receivedSnapshot.forEach((docSnap) => {
        received.push({ id: docSnap.id, ...docSnap.data() } as ExchangeRequest);
      });

      sentSnapshot.forEach((docSnap) => {
        sent.push({ id: docSnap.id, ...docSnap.data() } as ExchangeRequest);
      });

      received.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(0);
        const timeB = b.createdAt?.toDate?.() || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });

      sent.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(0);
        const timeB = b.createdAt?.toDate?.() || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });

      setReceivedRequests(received);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error fetching exchange requests:', error);
      alert('Failed to load exchange requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'exchangeRequests', requestId), {
        status: 'accepted',
        updatedAt: new Date()
      });

      alert('Exchange request accepted! 🎉\nYou can now chat with the requester to arrange the exchange.');
      fetchExchangeRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'exchangeRequests', requestId), {
        status: 'rejected',
        updatedAt: new Date()
      });

      alert('Exchange request rejected');
      fetchExchangeRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleChatClick = async (request: ExchangeRequest) => {
    const otherUserId = activeTab === 'received' ? request.requesterId : request.targetOwnerId;
    const otherUserName = activeTab === 'received' ? request.requesterName : request.targetOwnerName;
    const bookTitle = activeTab === 'received' ? request.requesterBookTitle : request.targetBookTitle;
    const bookImage = activeTab === 'received' ? request.requesterBookImage : request.targetBookImage;
    
    try {
      // Check if chat room already exists
      const chatsRef = collection(db, 'chatRooms');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      
      let existingChatRoom = null;
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.participants.includes(otherUserId)) {
          existingChatRoom = docSnap.id;
        }
      });

      if (existingChatRoom) {
        navigate(`/chat/${existingChatRoom}`);
      } else {
        // Create new chat room
        const chatRoomData = {
          participants: [currentUser?.uid, otherUserId],
          participantNames: {
            [currentUser?.uid || '']: userData?.name || currentUser?.displayName || 'User',
            [otherUserId]: otherUserName
          },
          bookTitle: bookTitle,
          bookImage: bookImage,
          lastMessage: '',
          lastMessageTime: new Date(),
          createdAt: new Date(),
          type: 'exchange'
        };

        const chatRoomRef = await addDoc(collection(db, 'chatRooms'), chatRoomData);
        navigate(`/chat/${chatRoomRef.id}`);
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Failed to open chat. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"><BsClock /> Pending</span>;
      case 'accepted':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"><BsCheck /> Accepted</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"><BsX /> Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Exchange Requests" showBack={true} showProfile={true} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="Exchange Requests" showBack={true} showProfile={true} />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-4 text-center font-semibold transition ${
              activeTab === 'received'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600'
            }`}
          >
            Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-4 text-center font-semibold transition ${
              activeTab === 'sent'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BsArrowRepeat className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              {activeTab === 'received'
                ? 'No exchange requests received yet'
                : 'No exchange requests sent yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(request.status)}
                  <p className="text-sm text-gray-500">
                    {request.createdAt?.toDate ? 
                      new Date(request.createdAt.toDate()).toLocaleDateString() : 
                      'N/A'
                    }
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">
                      {activeTab === 'received' ? 'They offer:' : 'You offered:'}
                    </p>
                    <div className="flex gap-3">
                      <img
                        src={request.requesterBookImage}
                        alt={request.requesterBookTitle}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {request.requesterBookTitle}
                        </h4>
                        <p className="text-xs text-gray-600">{request.requesterBookAuthor}</p>
                      </div>
                    </div>
                  </div>

                  <BsArrowRepeat className="text-2xl text-orange-500" />

                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-2">
                      {activeTab === 'received' ? 'For your:' : 'You wanted:'}
                    </p>
                    <div className="flex gap-3">
                      <img
                        src={request.targetBookImage}
                        alt={request.targetBookTitle}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {request.targetBookTitle}
                        </h4>
                        <p className="text-xs text-gray-600">{request.targetBookAuthor}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {request.message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Message:</span> {request.message}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-4">
                  {activeTab === 'received' ? (
                    <>From: <span className="font-semibold">{request.requesterName}</span></>
                  ) : (
                    <>To: <span className="font-semibold">{request.targetOwnerName}</span></>
                  )}
                </p>

                {activeTab === 'received' && request.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                    >
                      Accept Exchange
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <button
                    onClick={() => handleChatClick(request)}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    Chat to Arrange Exchange
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
